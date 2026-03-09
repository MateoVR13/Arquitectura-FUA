import { openDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await req.json();
        const { blockId } = body;

        if (!blockId) {
            return NextResponse.json({ error: 'Falta blockId' }, { status: 400 });
        }

        const db = await openDb();

        // 1. Mark current block as completed
        await db.run(
            `INSERT INTO progress (user_id, block_id, status) 
             VALUES (?, ?, ?) 
             ON CONFLICT(user_id, block_id) 
             DO UPDATE SET status=excluded.status, updated_at=CURRENT_TIMESTAMP`,
            [session.id, blockId, 'completed']
        );

        // 2. Unlock the next block (blockId + 1)
        const nextBlock = blockId + 1;

        // Ensure we only unlock it if it's not already completed
        const nextBlockStatus = await db.get(
            `SELECT status FROM progress WHERE user_id = ? AND block_id = ?`,
            [session.id, nextBlock]
        );

        if (!nextBlockStatus || nextBlockStatus.status === 'locked') {
            await db.run(
                `INSERT INTO progress (user_id, block_id, status) 
                 VALUES (?, ?, ?) 
                 ON CONFLICT(user_id, block_id) 
                 DO UPDATE SET status=excluded.status, updated_at=CURRENT_TIMESTAMP`,
                [session.id, nextBlock, 'unlocked']
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in /api/progress:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
