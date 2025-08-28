
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Game, PlaySession, GameWithPlaytime, PlaySessionWithGame } from './types';
import { unstable_cache as cache } from 'next/cache';

const GAMES_COLLECTION = 'games';
const SESSIONS_COLLECTION = 'play_sessions';

const toGame = (doc: any): Game => {
    const data = doc.data();
    return { 
        id: doc.id,
        ...data,
    } as Game;
};

const toSession = (doc: any): PlaySession => {
    const data = doc.data();
    return { 
        id: doc.id, 
        ...data,
        date: data.date.toDate().toISOString(),
    } as PlaySession;
};

export const getGames = cache(
  async (): Promise<Game[]> => {
    console.log("Fetching all games from Firestore...");
    const snapshot = await getDocs(query(collection(db, GAMES_COLLECTION), orderBy("title")));
    const games = snapshot.docs.map(toGame);
    console.log(`Fetched ${games.length} games.`);
    return games;
  },
  ['games'],
  { tags: ['games'] }
);

export async function addGame(game: Omit<Game, 'id'>): Promise<Game> {
  const docRef = await addDoc(collection(db, GAMES_COLLECTION), game);
  return { id: docRef.id, ...game };
}

export async function updateGame(id: string, game: Partial<Omit<Game, 'id'>>): Promise<Game> {
  const docRef = doc(db, GAMES_COLLECTION, id);
  await updateDoc(docRef, game);
  const updatedDoc = await getDoc(docRef);
  return { id: updatedDoc.id, ...updatedDoc.data() } as Game;
}

export async function deleteGame(id: string) {
  const batch = writeBatch(db);
  
  const gameRef = doc(db, GAMES_COLLECTION, id);
  batch.delete(gameRef);

  const sessionsQuery = query(collection(db, SESSIONS_COLLECTION), where('gameId', '==', id));
  const sessionsSnapshot = await getDocs(sessionsQuery);
  sessionsSnapshot.forEach(doc => batch.delete(doc.ref));

  await batch.commit();
}

export async function toggleFavoriteAction(id: string, isFavorite: boolean) {
  const docRef = doc(db, GAMES_COLLECTION, id);
  await updateDoc(docRef, { isFavorite: !isFavorite });
}

export const getSessions = cache(
    async (): Promise<PlaySession[]> => {
        console.log("Fetching all play sessions from Firestore...");
        const snapshot = await getDocs(query(collection(db, SESSIONS_COLLECTION), orderBy('date', 'desc')));
        const sessions = snapshot.docs.map(toSession);
        console.log(`Fetched ${sessions.length} sessions.`);
        return sessions;
    },
    ['sessions'],
    { tags: ['sessions'] }
);

export async function logSession(session: Omit<PlaySession, 'id' | 'date'> & { date: Date }) {
    await addDoc(collection(db, SESSIONS_COLLECTION), {
        ...session,
        date: Timestamp.fromDate(session.date)
    });
}

export const getStats = cache(
    async () => {
        console.log("Calculating stats...");
        const sessionsSnap = await getDocs(collection(db, SESSIONS_COLLECTION));
        const gamesSnap = await getDocs(collection(db, GAMES_COLLECTION));

        const totalGames = gamesSnap.size;
        const totalSessions = sessionsSnap.size;
        const totalPlaytime = sessionsSnap.docs
            .map(doc => doc.data().duration as number)
            .reduce((sum, duration) => sum + duration, 0);
        
        console.log("Stats:", { totalGames, totalSessions, totalPlaytime });
        return { totalGames, totalSessions, totalPlaytime };
    },
    ['stats'],
    { tags: ['games', 'sessions'] }
);

export const getRecentSessions = cache(
    async (count: number): Promise<PlaySessionWithGame[]> => {
        console.log(`Fetching ${count} recent sessions...`);
        const q = query(collection(db, SESSIONS_COLLECTION), orderBy('date', 'desc'), limit(count));
        const sessionsSnap = await getDocs(q);
        
        const sessionsWithGames = await Promise.all(sessionsSnap.docs.map(async (sessionDoc) => {
            const sessionData = toSession(sessionDoc);
            const gameDoc = await getDoc(doc(db, GAMES_COLLECTION, sessionData.gameId));
            const game = gameDoc.exists() ? toGame(gameDoc) : { id: sessionData.gameId, title: 'Deleted Game', genre: '', gameMechanics: '', minPlayers: 0, maxPlayers: 0 };
            return {
                ...sessionData,
                game,
            };
        }));
        
        console.log(`Found ${sessionsWithGames.length} recent sessions with game data.`);
        return sessionsWithGames;

    },
    ['recent-sessions'],
    { tags: ['sessions', 'games'] }
);

export const getGamesWithAggregatedPlaytime = cache(
    async (): Promise<GameWithPlaytime[]> => {
        console.log("Aggregating playtime for games...");
        const sessions = await getSessions();
        const games = await getGames();

        const playtimeMap = new Map<string, number>();
        sessions.forEach(session => {
            playtimeMap.set(session.gameId, (playtimeMap.get(session.gameId) || 0) + session.duration);
        });

        const result = games.map(game => ({
            ...game,
            totalPlaytime: playtimeMap.get(game.id) || 0,
        }));
        console.log(`Aggregated playtime for ${result.length} games.`);
        return result;
    },
    ['games-with-playtime'],
    { tags: ['games', 'sessions'] }
);
