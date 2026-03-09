import { openDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LaboratorioClient from './LaboratorioClient';

export default async function LaboratorioPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    if (session.username === 'admin') {
        redirect('/dashboard');
    }

    const db = await openDb();

    // fetch progress for this user
    const progress = await db.all(
        'SELECT block_id, status, score FROM progress WHERE user_id = ? ORDER BY block_id ASC',
        [session.id]
    );

    return (
        <LaboratorioClient user={session} initialProgress={progress} />
    );
}
