import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, username, email, age, extra_info, password } = body;

        if (!name || !username || !password) {
            return NextResponse.json({ error: 'Faltan campos obligatorios (name, username, password).' }, { status: 400 });
        }

        const db = await openDb();

        // Check if username already exists
        const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUser) {
            return NextResponse.json({ error: 'El nombre de usuario ya está en uso.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.run(
            `INSERT INTO users (name, username, email, age, extra_info, password) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [name, username, email || null, age || null, extra_info || null, hashedPassword]
        );

        // Initial progress creation
        for (let i = 1; i <= 4; i++) {
            await db.run(
                `INSERT INTO progress (user_id, block_id, status) VALUES (?, ?, ?)`,
                [result.lastID, i, i === 1 ? 'unlocked' : 'locked']
            );
        }

        return NextResponse.json({ message: 'Usuario registrado exitosamente', userId: result.lastID }, { status: 201 });
    } catch (error) {
        console.error('Error registrando usuario:', error);
        return NextResponse.json({ error: 'Ocurrió un error en el servidor.' }, { status: 500 });
    }
}
