"use server";

import { addGame, updateGame, deleteGame, toggleFavoriteAction as toggleFavoriteDb } from '@/lib/firestore';
import { revalidateTag } from 'next/cache';
import type { Game } from "@/lib/types";

export async function addOrUpdateGameAction(prevState: any, formData: FormData) {
  try {
    const gameData = {
      title: formData.get('title') as string,
      genre: (formData.get('genre') as string) || '',
      gameMechanics: formData.get('gameMechanics') as string,
      minPlayers: parseInt(formData.get('minPlayers') as string),
      maxPlayers: parseInt(formData.get('maxPlayers') as string),
      typicalPlaytime: formData.get('typicalPlaytime') 
        ? parseInt(formData.get('typicalPlaytime') as string) 
        : undefined,
      boxColor: (formData.get('boxColor') as string) || undefined,
      isFavorite: formData.get('isFavorite') === 'on',
    };

    const gameId = formData.get('id') as string;
    
    if (gameId) {
      await updateGame(gameId, gameData);
    } else {
      await addGame(gameData as Omit<Game, 'id'>);
    }

    revalidateTag('games');

    return {
      message: gameId ? "Game updated!" : "Game added!",
      error: null
    };
  } catch (error: any) {
    return {
      message: null,
      error: error.message || "Failed to save game"
    };
  }
}


export async function deleteGameAction(id: string) {
    if (!id) {
        return { error: "Invalid game ID." };
    }
    try {
        await deleteGame(id);
        revalidateTag("games");
        return { message: "Game deleted successfully." };
    } catch (e: any) {
        return { error: e.message || "Failed to delete game." };
    }
}

export async function toggleFavoriteAction(id: string, isFavorite: boolean) {
  try {
    await toggleFavoriteDb(id, isFavorite);
    revalidateTag("games");
    return { message: 'Favorite status updated.' };
  } catch (e: any) {
    return { error: e.message || 'Failed to update favorite status.' };
  }
}
