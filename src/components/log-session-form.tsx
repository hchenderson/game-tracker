
"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CalendarIcon, PlusCircle, Trash2, User, Award } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Game, SessionPlayer } from "@/lib/types";
import { logSessionAction } from "@/app/log/actions";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const initialState = {
  message: null,
  error: null,
};

const NO_WINNER_VALUE = "__NO_WINNER__";

export function LogSessionForm({ games }: { games: Game[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(logSessionAction, initialState);
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [players, setPlayers] = useState<SessionPlayer[]>([]);
  const [winner, setWinner] = useState<string>('');

  useEffect(() => {
    if (state.message) {
      toast({ title: "Success", description: state.message });
      formRef.current?.reset();
      setDate(new Date());
      setPlayers([]);
      setWinner('');
      router.push('/');
    }
    if (state.error) {
      toast({ variant: "destructive", title: "Error", description: state.error });
    }
  }, [state, toast, router]);

  const handleFormAction = (formData: FormData) => {
    if (date) {
      formData.set('date', date.toISOString());
    }
    players.forEach(p => {
        formData.append('players', JSON.stringify(p))
    });
    if (winner) {
        formData.set('winner', winner);
    }
    formAction(formData);
  }

  const handleWinnerChange = (value: string) => {
    if (value === NO_WINNER_VALUE) {
      setWinner('');
    } else {
      setWinner(value);
    }
  };

  const addPlayer = () => {
    setPlayers([...players, { name: '', score: 0 }]);
  };

  const updatePlayer = (index: number, field: 'name' | 'score', value: string | number) => {
    const newPlayers = [...players];
    if (field === 'name') {
        newPlayers[index].name = value as string;
    } else {
        newPlayers[index].score = Number(value);
    }
    setPlayers(newPlayers);
  };
  
  const removePlayer = (index: number) => {
    const playerToRemove = players[index];
    if (playerToRemove.name && playerToRemove.name === winner) {
      setWinner('');
    }
    const newPlayers = players.filter((_, i) => i !== index);
    setPlayers(newPlayers);
  };

  return (
    <form ref={formRef} action={handleFormAction} className="grid gap-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="gameId">Game</Label>
          {games.length > 0 ? (
            <Select name="gameId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a game..." />
              </SelectTrigger>
              <SelectContent>
                {games.map((game) => (
                  <SelectItem key={game.id} value={game.id}>{game.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">No games found. <a href="/games" className="text-primary underline">Add a game</a> first.</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input id="duration" name="duration" type="number" min="1" placeholder="60" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea id="notes" name="notes" placeholder="Any memorable moments, scores, or thoughts..." />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Players & Scores
            <Button type="button" variant="outline" size="sm" onClick={addPlayer}><PlusCircle className="mr-2 h-4 w-4" /> Add Player</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {players.map((player, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="relative">
                        <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Player Name" 
                            value={player.name} 
                            onChange={(e) => updatePlayer(index, 'name', e.target.value)} 
                            className="pl-8"
                        />
                    </div>
                     <div className="relative">
                        <Award className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="number" 
                            placeholder="Score" 
                            value={player.score} 
                            onChange={(e) => updatePlayer(index, 'score', e.target.value)} 
                             className="pl-8"
                        />
                     </div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removePlayer(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {players.length > 0 && (
                <div className="space-y-2">
                    <Label htmlFor="winner">Winner</Label>
                    <Select onValueChange={handleWinnerChange} value={winner}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select the winner..." />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value={NO_WINNER_VALUE}>No Winner</SelectItem>
                            {players.filter(p => p.name).map((player, index) => (
                                <SelectItem key={index} value={player.name}>{player.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </CardContent>
      </Card>
      
      <Button type="submit" className="w-full" disabled={isPending || games.length === 0}>
        {isPending ? 'Logging...' : 'Log Session'}
      </Button>
    </form>
  );
}
