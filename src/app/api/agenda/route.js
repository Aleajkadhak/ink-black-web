import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('inkblackDB');
    
    const citas = await db.collection('citas').find({}).sort({ fecha: 1, hora: 1 }).toArray();
    const formateadas = citas.map(c => ({ ...c, id: c._id.toString() }));
    
    return NextResponse.json(formateadas, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener la agenda' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id } = await request.json();
    const client = await clientPromise;
    const db = client.db('inkblackDB');
    
    await db.collection('citas').updateOne(
      { _id: new ObjectId(id) },
      { $set: { estado: 'Cancelada' } }
    );
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al cancelar la cita' }, { status: 500 });
  }
}