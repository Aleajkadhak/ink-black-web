import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Limpiamos espacios en blanco accidentales
    const emailLimpio = email.trim().toLowerCase();

    const client = await clientPromise;
    const db = client.db('inkblackDB');
    const usersCollection = db.collection('Users-InkBlack');

    // 1. Buscar al usuario
    const user = await usersCollection.findOne({ email: emailLimpio });
    
    if (!user) {
      // Mensaje genérico por seguridad
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // 2. Comparar contraseñas
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    
    if (!isPasswordValid) {
      // Mensaje genérico por seguridad
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // 3. Generar un Token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET || 'secreto_temporal',
      { expiresIn: '1d' }
    );

    // 4. Devolver el token
    return NextResponse.json({ 
      message: 'Login exitoso',
      token,
      user: { username: user.username, email: user.email }
    }, { status: 200 });

  } catch (error) {
    console.error("Error en el servidor:", error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}