import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ error: 'Faltan credenciales.' }, { status: 400 });
        }

        const db = await openDb();
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json({ error: 'Contraseña incorrecta.' }, { status: 401 });
        }

        // Create session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const session = await encrypt({ id: user.id, username: user.username, name: user.name, expires });

        const response = NextResponse.json({ message: 'Login exitoso', success: true });

        response.cookies.set('session', session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: expires,
            sameSite: 'lax',
            path: '/'
        });

        return response;
    } catch (error) {
        console.error('Error en login:', error);
        return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
    }
}
