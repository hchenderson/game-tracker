
"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { logSession } from "@/lib/firestore";

const PlayerSchema = z.object({
  name: z.string().min(1, "Player name cannot be empty."),
  score: z.coerce.number(),
});

const SessionSchema = z.object({
  gameId: z.string().min(1, "You must select a game."),
  date: z.string().transform((str) => new Date(str)),
  duration: z.coerce.number().int().min(1, "Duration must be at least 1 minute."),
  notes: z.string().optional().transform(val => val === '' ? undefined : val),
  players: z.array(PlayerSchema).optional(),
  winner: z.string().optional().transform(val => val === '' ? undefined : val),
});

export async function logSessionAction(prevState: any, formData: FormData) {
  const playersData = formData.getAll("players");
  // Handle case where players might not exist
  const parsedPlayers = playersData ? playersData.map(p => JSON.parse(p as string)) : [];
  
  const dataToValidate = {
    ...Object.fromEntries(formData.entries()),
    players: parsedPlayers.length > 0 ? parsedPlayers : undefined,
  };
  
  const validatedFields = SessionSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
      console.error(validatedFields.error.flatten().fieldErrors);
    return {
      error: "Please fill out all required fields correctly.",
      message: null,
    };
  }
  
  const { gameId, ...sessionData } = validatedFields.data;

  try {
    await logSession({
        gameId,
        ...sessionData
    });
    revalidateTag("sessions");
    revalidateTag("games"); // For stats pages
    return { message: "Play session logged successfully.", error: null };
  } catch (e) {
    console.error(e)
    return { message: null, error: "Failed to log session." };
  }
}
