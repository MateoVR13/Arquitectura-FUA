import { openDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    // Assuming specific admin username for now, or just treating any logged in user here as admin per new requirements
    // "el dashboard es UNICAMENTE PARA EL ADMINISTRADOR"
    if (session.username !== 'admin') {
        // If not admin, theoretically redirect to their own portal. But for now, app only has dashboard. 
        // We will allow 'admin', else redirect to block 1. (If they are standard users)
        redirect('/bloques/1');
    }

    const db = await openDb();

    // Fetch stats for the admin
    const totalUsersReq = await db.get('SELECT COUNT(*) as count FROM users');
    const activeReq = await db.get('SELECT COUNT(DISTINCT user_id) as count FROM progress WHERE status = "completed" OR status = "unlocked"');
    const completedBlocksReq = await db.get('SELECT COUNT(*) as count FROM progress WHERE status = "completed"');

    // Recent 24h count
    const recent24h = await db.get("SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-1 day')");

    const recentUsers = await db.all(`
    SELECT u.id, u.name, u.username, u.email, u.created_at, 
           (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.status = 'completed') as completed_blocks
    FROM users u 
    ORDER BY u.created_at DESC 
    LIMIT 10
  `);

    const stats = {
        totalUsers: totalUsersReq.count,
        activeUsers: activeReq.count,
        completionRate: totalUsersReq.count > 0 ? Math.round((activeReq.count / totalUsersReq.count) * 100) : 0,
        totalCompletedBlocks: completedBlocksReq.count || 0,
        recentSignups: recent24h.count || 0
    };

    return (
        <DashboardClient user={session} stats={stats} usersList={recentUsers} />
    );
}
