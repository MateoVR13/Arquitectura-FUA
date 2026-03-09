import { openDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Block1Client from './Block1Client';

export default async function Block1Page() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const db = await openDb();

    // verify user has access to block 1
    const progress = await db.get(
        'SELECT status FROM progress WHERE user_id = ? AND block_id = 1',
        [session.id]
    );

    if (!progress || progress.status === 'locked') {
        redirect('/dashboard');
    }

    return <Block1Client user={session} />;
}
