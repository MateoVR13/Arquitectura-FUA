import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session || session.username !== 'admin') {
            return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
        }

        const { userId, newPassword } = await request.json();

        if (!userId || !newPassword) {
            return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
        }

        const db = await openDb();
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        await db.run('UPDATE password_resets SET status = "resolved" WHERE user_id = ? AND status = "pending"', [userId]);

        return NextResponse.json({ message: 'Contraseña actualizada exitosamente.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
    }
}
