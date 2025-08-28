"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter, useSearchParams } from "next/navigation";

export function PlayNowForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const players = formData.get("players") as string;
    const notPlayedSince = formData.get("notPlayedSince") as string;
    const isFavorite = formData.get("isFavorite") as string;
    const maxPlaytime = formData.get("maxPlaytime") as string;


    const params = new URLSearchParams(searchParams.toString());
    if (players) params.set("players", players);
    else params.delete("players");

    if (notPlayedSince) params.set("notPlayedSince", notPlayedSince);
    else params.delete("notPlayedSince");

    if (isFavorite) params.set("isFavorite", "true");
    else params.delete("isFavorite");

    if (maxPlaytime) params.set("maxPlaytime", maxPlaytime);
    else params.delete("maxPlaytime");
    
    router.push(`/play?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-5 items-end gap-4">
      <div className="grid w-full gap-1.5">
        <Label htmlFor="players">How many players?</Label>
        <Input 
            id="players" 
            name="players" 
            type="number" 
            min="1" 
            placeholder="e.g., 2" 
            defaultValue={searchParams.get('players') || ''}
        />
      </div>
       <div className="grid w-full gap-1.5">
        <Label htmlFor="maxPlaytime">Max Playtime (mins)?</Label>
        <Input 
            id="maxPlaytime" 
            name="maxPlaytime" 
            type="number" 
            min="1" 
            placeholder="e.g., 120"
            defaultValue={searchParams.get('maxPlaytime') || ''}
        />
      </div>
      <div className="grid w-full gap-1.5">
        <Label htmlFor="notPlayedSince">Not played since (days)?</Label>
        <Input 
            id="notPlayedSince" 
            name="notPlayedSince" 
            type="number" 
            min="1" 
            placeholder="e.g., 30"
            defaultValue={searchParams.get('notPlayedSince') || ''}
        />
      </div>
       <div className="flex items-center h-10 space-x-2">
        <Checkbox 
            id="isFavorite" 
            name="isFavorite" 
            defaultChecked={searchParams.get('isFavorite') === 'true'}
        />
        <Label htmlFor="isFavorite" className="font-normal">
          Favorites only
        </Label>
      </div>
      <Button type="submit" className="w-full lg:w-auto">Find a Game</Button>
    </form>
  );
}
