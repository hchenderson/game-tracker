
import { getGames, getSessions } from "@/lib/firestore";
import { GameCard } from "@/components/game-card";
import type { Game, PlaySession } from "@/lib/types";
import { PlayNowForm } from "@/components/play-now-form";
import { Card } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";
import { subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function PlayPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [allGames, allSessions] = await Promise.all([getGames(), getSessions()]);

  const playerCount = Number(searchParams?.players) || 0;
  const isFavorite = searchParams?.isFavorite === 'true';
  const notPlayedSince = Number(searchParams?.notPlayedSince) || 0;
  const maxPlaytime = Number(searchParams?.maxPlaytime) || 0;
  
  let filteredGames: Game[] = allGames;

  if (playerCount > 0) {
    filteredGames = filteredGames.filter(game => game.minPlayers <= playerCount && game.maxPlayers >= playerCount);
  }

  if (isFavorite) {
    filteredGames = filteredGames.filter(game => game.isFavorite);
  }

  if (notPlayedSince > 0) {
    const cutoffDate = subDays(new Date(), notPlayedSince);
    const recentGameIds = new Set(
      allSessions
        .filter(session => new Date(session.date) > cutoffDate)
        .map(session => session.gameId)
    );
    filteredGames = filteredGames.filter(game => !recentGameIds.has(game.id));
  }

  if (maxPlaytime > 0) {
    filteredGames = filteredGames.filter(game => game.typicalPlaytime && game.typicalPlaytime <= maxPlaytime);
  }
  
  const hasFilters = playerCount > 0 || isFavorite || notPlayedSince > 0 || maxPlaytime > 0;

  // Dummy playtime for GameCard compatibility as it expects GameWithPlaytime
  const gamesWithPlaytime = filteredGames.map(g => ({...g, totalPlaytime: 0}));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Play Now</h1>
      <Card className="p-6">
        <PlayNowForm />
      </Card>
      
      {hasFilters && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Suggestions
          </h2>
          {filteredGames.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {gamesWithPlaytime.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <Gamepad2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No games match your criteria.</h3>
              <p className="text-muted-foreground">Try adjusting your filters or adding more games to your library.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
