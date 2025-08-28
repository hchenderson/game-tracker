"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { Game } from "@/lib/types";
import { addOrUpdateGameAction } from "@/app/games/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const initialState = {
  message: null,
  error: null,
};

export function GameForm({ game, onFormSubmit }: { game?: Game, onFormSubmit: () => void }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(addOrUpdateGameAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({ title: "Success", description: state.message });
      onFormSubmit();
      router.refresh();
    } else if (state.error) {
      toast({
        variant: "destructive",
        title: "Error saving game",
        description: state.error || "An unknown error occurred."
      });
    }
  }, [state, toast, onFormSubmit, router]);

  return (
    <form action={formAction} className="grid gap-4">
      {game && <input type="hidden" name="id" value={game.id} />}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="The Legend of Zelda: Tears of the Kingdom" defaultValue={game?.title} required />
      </div>
       <div className="space-y-2">
        <Label htmlFor="genre">Genre</Label>
        <Input id="genre" name="genre" placeholder="e.g., Adventure, Strategy" defaultValue={game?.genre} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gameMechanics">Game Mechanics</Label>
        <Input id="gameMechanics" name="gameMechanics" placeholder="e.g., Deck-building" defaultValue={game?.gameMechanics} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="minPlayers">Min Players</Label>
            <Input id="minPlayers" name="minPlayers" type="number" min="1" placeholder="1" defaultValue={game?.minPlayers} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="maxPlayers">Max Players</Label>
            <Input id="maxPlayers" name="maxPlayers" type="number" min="1" placeholder="4" defaultValue={game?.maxPlayers} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="typicalPlaytime">Typical Playtime (mins)</Label>
            <Input id="typicalPlaytime" name="typicalPlaytime" type="number" min="1" placeholder="e.g., 90" defaultValue={game?.typicalPlaytime} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="boxColor">Box Color</Label>
            <Input id="boxColor" name="boxColor" placeholder="e.g., #ff0000 or blue" defaultValue={game?.boxColor} />
        </div>
      </div>
       <div className="flex items-center space-x-2">
        <Checkbox id="isFavorite" name="isFavorite" defaultChecked={game?.isFavorite} />
        <Label htmlFor="isFavorite" className="font-normal">
          Mark as favorite
        </Label>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Saving...' : (game ? 'Update Game' : 'Add Game')}
      </Button>
    </form>
  );
}
