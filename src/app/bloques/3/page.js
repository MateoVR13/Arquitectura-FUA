import { getSession } from '@/lib/auth';
import { openDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import Block3Client from './Block3Client';

export default async function Block3Page() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const db = await openDb();

    // Verify Block 3 access
    const progress = await db.get(
        'SELECT status FROM progress WHERE user_id = ? AND block_id = 3',
        [session.id]
    );

    if (!progress || progress.status === 'locked') {
        redirect('/laboratorio');
    }

    return (
        <Block3Client user={session} />
    );
}
