import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Evita que Next.js guarde esto en caché, para que siempre veas datos en vivo
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('inkblackDB');

    // 1. Buscar las citas de HOY
    // Obtenemos la fecha actual en formato YYYY-MM-DD acorde a México
    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    
    const citas = await db.collection('citas')
      .find({ fecha: hoy })
      .sort({ hora: 1 }) // Ordenar por hora (temprano a tarde)
      .toArray();

    // 2. Buscar alertas de inventario (Stock menor o igual a 3, o agotado)
    const alertas = await db.collection('productos')
      .find({ stock_actual: { $lte: 3 } })
      .toArray();

    // 3. Formatear los datos para que el frontend los entienda
    const citasFormateadas = citas.map(c => ({ ...c, id: c._id.toString() }));
    const alertasFormateadas = alertas.map(a => ({ ...a, id: a._id.toString() }));

    return NextResponse.json({ 
      citas: citasFormateadas, 
      alertas: alertasFormateadas 
    }, { status: 200 });

  } catch (error) {
    console.error("Error al cargar el dashboard:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}