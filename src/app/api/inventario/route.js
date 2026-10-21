import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('inkblackDB');
    const productos = await db.collection('productos').find({}).sort({ nombre: 1 }).toArray();
    
    // Formateamos el _id de Mongo para que el Frontend lo entienda como "id"
    const formateados = productos.map(p => ({ ...p, id: p._id.toString() }));
    
    return NextResponse.json(formateados, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener inventario' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const client = await clientPromise;
    const db = client.db('inkblackDB');
    
    await db.collection('productos').insertOne(data);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, ...updates } = await request.json();
    const client = await clientPromise;
    const db = client.db('inkblackDB');
    
    await db.collection('productos').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}