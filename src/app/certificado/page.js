import { openDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CertificadoClient from './CertificadoClient';

export default async function CertificadoPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const db = await openDb();

    // Fetch progress for this user
    const progress = await db.all(
        'SELECT block_id, status FROM progress WHERE user_id = ? ORDER BY block_id ASC',
        [session.id]
    );

    const progressMap = {};
    progress.forEach(p => {
        progressMap[p.block_id] = p.status;
    });

    // Verify all blocks (1-4) + reto final (5) are completed
    const allCompleted = [1, 2, 3, 4, 5].every(id => progressMap[id] === 'completed');

    if (!allCompleted) {
        redirect('/laboratorio');
    }

    return (
        <CertificadoClient user={session} />
    );
}
