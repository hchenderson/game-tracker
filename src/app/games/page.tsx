import { getGames } from "@/lib/firestore";
import { GameList } from "@/components/game-list";
import type { GameWithPlaytime } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function GamesPage() {
  const games = await getGames();

  // The GameList component expects games with playtime, so we'll add a dummy value.
  // A better solution would be to aggregate this in Firestore directly if performance becomes an issue.
  const gamesWithPlaytime: GameWithPlaytime[] = games.map(game => ({
    ...game,
    totalPlaytime: 0, 
  }));

  return (
    <div className="flex flex-col gap-8">
      <GameList initialGames={gamesWithPlaytime} />
    </div>
  );
}
