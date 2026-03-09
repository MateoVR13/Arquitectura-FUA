import { getSession } from '@/lib/auth';
import { openDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import Block4Client from './Block4Client';

export default async function Block4Page() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const db = await openDb();

    // Verify Block 4 access
    const progress = await db.get(
        'SELECT status FROM progress WHERE user_id = ? AND block_id = 4',
        [session.id]
    );

    if (!progress || progress.status === 'locked') {
        redirect('/laboratorio');
    }

    return (
        <Block4Client user={session} />
    );
}
