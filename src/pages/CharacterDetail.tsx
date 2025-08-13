import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCharacter, RMCharacter } from "@/api/rickAndMorty";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowLeft } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const noteSchema = z.object({ note: z.string().max(300, "Max 300 characters").optional() });

type FormData = z.infer<typeof noteSchema>;

export default function CharacterDetail() {
  const { id } = useParams();
  const charId = Number(id);
  const { isFavorite, toggle } = useFavorites();

  const { data, isLoading, isError, error, refetch } = useQuery<RMCharacter>({
    queryKey: ["character", charId],
    queryFn: ({ signal }) => fetchCharacter(charId, signal),
    enabled: Number.isFinite(charId),
  });

  const storageKey = `rm_note_${charId}`;
  const form = useForm<FormData>({
    defaultValues: { note: localStorage.getItem(storageKey) ?? "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (data?.name) document.title = `${data.name} — Character Details`;
  }, [data?.name]);

  if (isLoading) return <div className="container py-10">Loading…</div>;
  if (isError)
    return (
      <div className="container py-10">
        <p className="font-medium mb-2">Failed to load character. {String((error as Error)?.message ?? "")}</p>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );

  if (!data) return null;

  return (
    <main className="container py-8">
      <header className="mb-6 flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2" /> Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{data.name}</h1>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 overflow-hidden">
          <img src={data.image} alt={`${data.name} — portrait`} className="w-full h-auto" />
          <CardContent className="flex items-center justify-between pt-4">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">{data.status}</Badge>
              <Badge variant="outline">{data.species}</Badge>
              <Badge variant="outline">{data.gender}</Badge>
            </div>
            <Button
              variant={isFavorite(data.id) ? "secondary" : "outline"}
              size="icon"
              aria-label={isFavorite(data.id) ? "Remove from favorites" : "Add to favorites"}
              onClick={() => toggle(data.id)}
            >
              <Heart className={isFavorite(data.id) ? "fill-current" : undefined} />
            </Button>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><span className="font-medium">Origin:</span> {data.origin.name}</p>
              <p><span className="font-medium">Last known location:</span> {data.location.name}</p>
              <p><span className="font-medium">Episodes:</span> {data.episode.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your note</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit((values) => {
                  const parsed = noteSchema.safeParse(values);
                  if (parsed.success) localStorage.setItem(storageKey, parsed.data.note ?? "");
                })}
                className="space-y-3"
              >
                <textarea
                  className="w-full rounded-md border border-input bg-background p-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={4}
                  {...form.register("note")}
                  placeholder="Add a personal note about this character…"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{(form.watch("note")?.length ?? 0)}/300</span>
                  <Button type="submit">Save note</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
