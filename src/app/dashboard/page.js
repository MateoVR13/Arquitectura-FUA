import { openDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    if (session.username !== 'admin') {
        redirect('/laboratorio');
    }

    const db = await openDb();

    // Summary stats
    const totalUsersReq = await db.get('SELECT COUNT(*) as count FROM users WHERE username != "admin"');
    const activeReq = await db.get('SELECT COUNT(DISTINCT user_id) as count FROM progress WHERE status = "completed"');
    const completedBlocksReq = await db.get('SELECT COUNT(*) as count FROM progress WHERE status = "completed"');
    const recent24h = await db.get("SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-1 day') AND username != 'admin'");
    const pendingResetsReq = await db.get('SELECT COUNT(*) as count FROM password_resets WHERE status = "pending"');

    // Completion by block
    const blockStats = await db.all(`
        SELECT block_id, 
               COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
               COUNT(CASE WHEN status = 'unlocked' THEN 1 END) as in_progress,
               COUNT(CASE WHEN status = 'locked' THEN 1 END) as locked
        FROM progress 
        WHERE block_id <= 5
        GROUP BY block_id
        ORDER BY block_id
    `);

    // Full user list with per-block progress
    const allUsers = await db.all(`
        SELECT u.id, u.name, u.email, u.created_at,
               MAX(CASE WHEN p.block_id = 1 THEN p.status END) as b1,
               MAX(CASE WHEN p.block_id = 2 THEN p.status END) as b2,
               MAX(CASE WHEN p.block_id = 3 THEN p.status END) as b3,
               MAX(CASE WHEN p.block_id = 4 THEN p.status END) as b4,
               MAX(CASE WHEN p.block_id = 5 THEN p.status END) as b5,
               (SELECT COUNT(*) FROM progress pp WHERE pp.user_id = u.id AND pp.status = 'completed') as completed_count
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id
        WHERE u.username != 'admin'
        GROUP BY u.id
        ORDER BY u.created_at DESC
    `);

    // Pending password reset requests
    const pendingResets = await db.all(`
        SELECT pr.id, pr.user_id, pr.created_at, u.name, u.email
        FROM password_resets pr
        JOIN users u ON pr.user_id = u.id
        WHERE pr.status = 'pending'
        ORDER BY pr.created_at DESC
    `);

    // Users who finished everything (all 4 blocks + reto)
    const fullyCompleted = await db.get(`
        SELECT COUNT(DISTINCT user_id) as count 
        FROM progress 
        WHERE user_id IN (
            SELECT user_id FROM progress WHERE block_id = 5 AND status = 'completed'
        )
    `);

    const stats = {
        totalUsers: totalUsersReq.count,
        activeUsers: activeReq.count,
        completionRate: totalUsersReq.count > 0 ? Math.round((activeReq.count / totalUsersReq.count) * 100) : 0,
        totalCompletedBlocks: completedBlocksReq.count || 0,
        recentSignups: recent24h.count || 0,
        pendingResets: pendingResetsReq.count || 0,
        fullyCompleted: fullyCompleted.count || 0,
        blockStats
    };

    return (
        <DashboardClient user={session} stats={stats} usersList={allUsers} pendingResets={pendingResets} />
    );
}
