
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStats, getRecentSessions } from '@/lib/firestore';
import { Gamepad2, Hourglass, PlusCircle, Swords, ListChecks, Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function Dashboard() {
  const stats = await getStats();
  const recentSessions = await getRecentSessions(5);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
           <Button asChild>
            <Link href="/log">
              <ListChecks />
              Log Play Session
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/games">
              <PlusCircle />
              Add New Game
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <Swords className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGames}</div>
            <p className="text-xs text-muted-foreground">in your library</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Played</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.totalPlaytime / 60)}
            </div>
             <p className="text-xs text-muted-foreground">across all games</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Logged</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
             <p className="text-xs text-muted-foreground">total play sessions</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Recent Activity</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Game</TableHead>
                <TableHead className="hidden sm:table-cell">Duration</TableHead>
                <TableHead>Players & Scores</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSessions.length > 0 ? (
                recentSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Gamepad2 className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{session.game.title}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{session.duration} mins</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {session.players && session.players.length > 0 ? (
                          session.players.map((p, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span>{p.name}: {p.score}</span>
                              {p.name === session.winner && <Award className="w-4 h-4 text-yellow-500" />}
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground">Solo play</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDistanceToNow(new Date(session.date), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No sessions logged yet. <Link href="/log" className="text-primary underline">Log your first session!</Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
