import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('inkblackDB');

    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();

    // 1. Citas reales (excluyendo canceladas)
    const citas = await db.collection('citas').find({ estado: { $ne: 'Cancelada' } }).toArray();

    // 2. Todos los productos del inventario
    const productos = await db.collection('productos').find({}).toArray();

    // 3. Insumos registrados ESTE MES (Usando el timestamp secreto del _id de MongoDB)
    const flujoMes = productos.filter(p => {
      const fechaCreacion = p._id.getTimestamp();
      return fechaCreacion.getMonth() === mesActual && fechaCreacion.getFullYear() === añoActual;
    });

    // 4. Análisis de popularidad de Kits
    const kits = citas.reduce((acc, c) => {
      const nombreKit = c.kit_nombre || 'Sin Kit';
      acc[nombreKit] = (acc[nombreKit] || 0) + 1;
      return acc;
    }, {});

    let maxKit = { nombre: 'Ninguno', cantidad: 0 };
    Object.entries(kits).forEach(([nombre, cant]) => {
      if (cant > maxKit.cantidad) maxKit = { nombre, cantidad: cant };
    });

    // 5. Salud de Stock (Porcentaje de productos que no están en nivel crítico)
    const criticos = productos.filter(p => p.stock_actual <= p.stock_minimo).length;
    const salud = productos.length > 0 ? ((productos.length - criticos) / productos.length) * 100 : 0;

    // Empaquetar todo el reporte
    const stats = {
      totalCitas: citas.length,
      insumosNuevosMes: flujoMes.length,
      usoKits: kits,
      topKit: maxKit,
      saludInventario: salud.toFixed(0)
    };

    return NextResponse.json(stats, { status: 200 });

  } catch (error) {
    console.error("Error al generar reportes:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}