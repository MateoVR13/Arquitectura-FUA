import { getSession } from '@/lib/auth';
import { openDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import Block2Client from './Block2Client';

export default async function Block2Page() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const db = await openDb();

    // Verify Block 2 access
    const progress = await db.get(
        'SELECT status FROM progress WHERE user_id = ? AND block_id = 2',
        [session.id]
    );

    if (!progress || progress.status === 'locked') {
        redirect('/laboratorio'); // Redirect back if not unlocked
    }

    return (
        <Block2Client user={session} />
    );
}
