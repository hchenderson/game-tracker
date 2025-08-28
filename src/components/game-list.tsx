
"use client";

import { AddGameDialog } from "./add-game-dialog";
import { GameCard } from "./game-card";
import type { GameWithPlaytime } from "@/lib/types";

export function GameList({ initialGames }: { initialGames: GameWithPlaytime[] }) {

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Game Library</h1>
        <AddGameDialog />
      </div>
      {initialGames.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {initialGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-medium">No games in your library yet.</h3>
          <p className="text-muted-foreground">Click &quot;Add New Game&quot; to get started!</p>
        </div>
      )}
    </>
  );
}
