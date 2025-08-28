
import type { Timestamp } from 'firebase/firestore';

export interface Game {
  id: string;
  title: string;
  gameMechanics: string;
  genre?: string;
  minPlayers: number;
  maxPlayers: number;
  coverArtUrl?: string;
  isFavorite?: boolean;
  typicalPlaytime?: number; // in minutes
  boxColor?: string;
}

export interface SessionPlayer {
  name: string;
  score: number;
}

// This type represents the data shape on the CLIENT, where Timestamps are strings.
export interface PlaySession {
  id: string;
  gameId: string;
  date: string; // ISO string
  duration: number; // in minutes
  notes?: string;
  players: SessionPlayer[];
  winner?: string;
}

// This type is used when saving to Firestore, where `date` is a Timestamp.
export interface PlaySessionFirestore extends Omit<PlaySession, 'date'> {
    date: Timestamp;
}

// Used when total playtime is calculated and attached.
export interface GameWithPlaytime extends Game {
  totalPlaytime: number;
}

// For client-side rendering, where Timestamps are converted.
export interface PlaySessionWithGame extends PlaySession {
  game: Game;
}
