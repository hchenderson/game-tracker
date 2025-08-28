import { getGames } from "@/lib/firestore";
import { LogSessionForm } from "@/components/log-session-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default async function LogSessionPage() {
  const games = await getGames();

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Log a New Play Session</CardTitle>
          <CardDescription>
            Record your gaming activity to track your progress and habits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogSessionForm games={games} />
        </CardContent>
      </Card>
    </div>
  );
}
