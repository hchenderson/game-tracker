import { getGamesWithAggregatedPlaytime } from "@/lib/firestore";
import { PlaytimeByGenreChart } from "@/components/playtime-by-genre-chart";
import { MostPlayedGamesChart } from "@/components/most-played-games-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart } from "lucide-react";
import type { GameWithPlaytime } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const gamesWithPlaytime: GameWithPlaytime[] = await getGamesWithAggregatedPlaytime();

  const playtimeByGenre = gamesWithPlaytime.reduce((acc, game) => {
    const genre = game.genre || "Uncategorized";
    acc[genre] = (acc[genre] || 0) + game.totalPlaytime;
    return acc;
  }, {} as Record<string, number>);

  const genreChartData = Object.entries(playtimeByGenre)
    .map(([genre, minutes]) => ({
      genre,
      minutes,
    }))
    .filter(item => item.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);
  
  const mostPlayedGamesData = [...gamesWithPlaytime]
    .filter(g => g.totalPlaytime > 0)
    .sort((a, b) => b.totalPlaytime - a.totalPlaytime)
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Game Statistics</h1>
      
      {gamesWithPlaytime.length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PieChart className="w-5 h-5" /> Playtime by Genre</CardTitle>
            </CardHeader>
            <CardContent>
              {genreChartData.length > 0 ? <PlaytimeByGenreChart data={genreChartData} /> : <p className="text-muted-foreground text-center py-8">No playtime logged yet.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart className="w-5 h-5" /> Most Played Games</CardTitle>
            </CardHeader>
            <CardContent>
               {mostPlayedGamesData.length > 0 ? <MostPlayedGamesChart data={mostPlayedGamesData} /> : <p className="text-muted-foreground text-center py-8">No playtime logged yet.</p>}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-medium">No game data available.</h3>
          <p className="text-muted-foreground">Add games and log sessions to see your stats here.</p>
        </div>
      )}
    </div>
  );
}
