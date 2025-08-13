import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { RMCharacter } from "@/api/rickAndMorty";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type Props = {
  character: RMCharacter;
  favorite: boolean;
  onToggleFavorite: (id: number) => void;
};

export function CharacterCard({ character, favorite, onToggleFavorite }: Props) {
  const navigate = useNavigate();
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <button
        onClick={() => navigate(`/character/${character.id}`)}
        className="text-left"
        aria-label={`Open details for ${character.name}`}
      >
        <img
          src={character.image}
          alt={`${character.name} — Rick and Morty character portrait`}
          loading="lazy"
          className="w-full h-56 object-cover"
        />
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span>{character.name}</span>
          </CardTitle>
        </CardHeader>
      </button>
      <CardContent className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">{character.status}</Badge>
          <Badge variant="outline">{character.species}</Badge>
        </div>
        <Button
          variant={favorite ? "secondary" : "outline"}
          size="icon"
          aria-pressed={favorite}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          onClick={() => onToggleFavorite(character.id)}
          className={cn(favorite && "animate-pulse")}
        >
          <Heart className={cn(favorite ? "fill-current" : undefined)} />
        </Button>
      </CardContent>
    </Card>
  );
}
