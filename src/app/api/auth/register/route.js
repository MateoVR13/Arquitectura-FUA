import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Formato de correo electrónico inválido.' }, { status: 400 });
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
        }

        // Validate name length
        if (name.trim().length < 3) {
            return NextResponse.json({ error: 'El nombre debe tener al menos 3 caracteres.' }, { status: 400 });
        }

        const db = await openDb();

        // Check if email already exists
        const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
        if (existingUser) {
            return NextResponse.json({ error: 'Este correo electrónico ya está registrado.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate username from email (part before @)
        const username = email.toLowerCase().split('@')[0];

        const result = await db.run(
            `INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)`,
            [name.trim(), username, email.toLowerCase(), hashedPassword]
        );

        // Initial progress: block 1 unlocked, rest locked
        for (let i = 1; i <= 4; i++) {
            await db.run(
                `INSERT INTO progress (user_id, block_id, status) VALUES (?, ?, ?)`,
                [result.lastID, i, i === 1 ? 'unlocked' : 'locked']
            );
        }

        return NextResponse.json({ message: 'Registro exitoso. Ahora puedes iniciar sesión.', userId: result.lastID }, { status: 201 });
    } catch (error) {
        console.error('Error registrando usuario:', error);
        return NextResponse.json({ error: 'Ocurrió un error en el servidor.' }, { status: 500 });
    }
}
