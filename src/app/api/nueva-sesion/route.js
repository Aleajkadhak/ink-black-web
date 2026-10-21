import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { cliente, estilo, fecha, hora, kit_nombre } = body;

    // Validación básica
    if (!cliente || !fecha || !hora) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('inkblackDB');

    // 1. Obtener la receta del kit seleccionado
    const receta = await db.collection('kits_insumos').find({ nombre_kit: kit_nombre }).toArray();

    const productosADescontar = [];

    // 2. VALIDACIÓN DE STOCK: Revisar si hay suficiente material antes de hacer cualquier cosa
    if (receta && receta.length > 0) {
      for (const item of receta) {
        const productoEnAlmacen = await db.collection('productos').findOne({ nombre: item.insumo_nombre });
        
        // Si no existe o no alcanza, abortamos TODO
        if (!productoEnAlmacen || productoEnAlmacen.stock_actual < item.cantidad_a_descontar) {
          return NextResponse.json({ 
            error: `STOCK INSUFICIENTE: Te faltan insumos de "${item.insumo_nombre}" para armar el ${kit_nombre}. Revisa tu inventario.` 
          }, { status: 400 });
        }

        // Guardamos la operación de resta en memoria
        productosADescontar.push({
          id: productoEnAlmacen._id,
          nuevoStock: productoEnAlmacen.stock_actual - item.cantidad_a_descontar
        });
      }
    }

    // 3. DESCONTAR MATERIAL (Si pasó la validación, hacemos las restas)
    for (const update of productosADescontar) {
      await db.collection('productos').updateOne(
        { _id: update.id },
        { $set: { stock_actual: update.nuevoStock } }
      );
    }

    // 4. AGENDAR LA CITA
    const nuevaCita = {
      cliente: cliente.trim(),
      estilo: estilo || 'Estilo Libre',
      fecha,
      hora,
      artista: 'Ale',
      estado: 'Confirmada',
      kit_nombre
    };

    await db.collection('citas').insertOne(nuevaCita);

    return NextResponse.json({ success: true, message: 'Sesión agendada' }, { status: 201 });

  } catch (error) {
    console.error("Error al registrar sesión:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}