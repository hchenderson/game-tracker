"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Clock, Edit, Gamepad2, MoreVertical, Trash2, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { GameWithPlaytime } from "@/lib/types";
import { deleteGameAction, toggleFavoriteAction } from "@/app/games/actions";
import { cn } from "@/lib/utils";
import { GameForm } from "./game-form";

export function GameCard({ game }: { game: GameWithPlaytime }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteGameAction(game.id);
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
      } else {
        toast({ title: "Success", description: "Game deleted successfully." });
        setIsDeleteOpen(false);
        router.refresh(); 
      }
    });
  };
  
  const handleToggleFavorite = () => {
    startTransition(async () => {
      const result = await toggleFavoriteAction(game.id, !!game.isFavorite);
       if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
      router.refresh();
    });
  };
  
  const playerRange = game.minPlayers === game.maxPlayers 
    ? game.minPlayers 
    : `${game.minPlayers}-${game.maxPlayers}`;

  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0 relative">
        <Image
          src={`https://picsum.photos/seed/${game.id}/400/300`}
          alt={`${game.title} cover art`}
          width={400}
          height={300}
          className="w-full h-40 object-cover rounded-t-lg"
          data-ai-hint={`${game.genre || ''} board game`}
        />
        <Button 
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleToggleFavorite}
            disabled={isPending}
        >
            <Star className={cn("w-5 h-5", game.isFavorite ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <CardTitle className="text-lg font-bold mb-2 truncate">{game.title}</CardTitle>
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="flex items-center gap-2"><Gamepad2 className="w-4 h-4" /> {game.gameMechanics}</p>
          <p className="flex items-center gap-2"><Users className="w-4 h-4" /> {playerRange} Player(s)</p>
          {game.typicalPlaytime && <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {game.typicalPlaytime} mins</p>}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
                <p className="text-sm font-medium capitalize">{game.genre || "N/A"}</p>
                {game.boxColor && (
                    <div 
                        className="w-4 h-4 rounded-full border" 
                        style={{ backgroundColor: game.boxColor }}
                        title={`Box Color: ${game.boxColor}`}
                    />
                )}
            </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsDeleteOpen(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit {game.title}</DialogTitle></DialogHeader>
          <GameForm game={game} onFormSubmit={() => setIsEditOpen(false)} />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{game.title}" and all its logged play sessions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
