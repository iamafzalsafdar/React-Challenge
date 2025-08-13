import { CharactersResponse, RMCharacter, fetchCharacters, fetchCharactersByIds } from "@/api/rickAndMorty";
import { CharacterCard } from "@/components/CharacterCard";
import { CharacterCardSkeleton } from "@/components/CharacterCardSkeleton";
import { FiltersBar } from "@/components/FiltersBar";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationLink } from "@/components/ui/pagination";
import { useFavorites } from "@/hooks/use-favorites";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

function useCharacters() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const status = params.get("status") ?? "";
  const gender = params.get("gender") ?? "";
  const sort = params.get("sort") ?? "name_asc";
  const page = Number(params.get("page") ?? "1");
  const favoritesOnly = params.get("favorites") === "1";
  const { favorites } = useFavorites();

  return useQuery<CharactersResponse>({
    queryKey: ["characters", { q, status, gender, sort, page, favoritesOnly, favorites }],
    queryFn: async ({ signal }) => {
      if (favoritesOnly) {
        const items = await fetchCharactersByIds(favorites, signal);
        return { info: { count: items.length, pages: 1, next: null, prev: null }, results: items } as CharactersResponse;
      }
      return fetchCharacters({ page, name: q || undefined, status: status || undefined, gender: gender || undefined, signal });
    },
    staleTime: 1000 * 60, // 1 min
    placeholderData: keepPreviousData,
  });
}

const sortResults = (results: RMCharacter[], sort: string) => {
  const sorted = [...results];
  if (sort === "name_desc") sorted.sort((a, b) => b.name.localeCompare(a.name));
  else sorted.sort((a, b) => a.name.localeCompare(b.name));
  return sorted;
};

const Index = () => {
  const [params, setParams] = useSearchParams();
  const { toggle, isFavorite } = useFavorites();
  const { data, isLoading, isError, error, refetch, isFetching } = useCharacters();
  const sort = params.get("sort") ?? "name_asc";
  const page = Number(params.get("page") ?? "1");
  const favoritesOnly = params.get("favorites") === "1";

  useScrollRestoration();

  useEffect(() => {
    document.title = "Resource Explorer — Rick and Morty Characters";
  }, []);

  const results = useMemo(() => (data ? sortResults(data.results, sort) : []), [data, sort]);

  const goPage = (n: number) => {
    const next = new URLSearchParams(params);
    next.set("page", String(n));
    setParams(next);
  };

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Resource Explorer — Rick and Morty Characters</h1>
        <p className="text-muted-foreground mt-1">Search, filter, sort, and favorite characters. URL reflects state.</p>
      </header>

      <section aria-label="Controls" className="mb-6">
        <FiltersBar />
      </section>

      {isError && (
        <div className="rounded-md border p-4 mb-6">
          <p className="font-medium">Failed to load. {String((error as Error)?.message ?? "")}</p>
          <button className="underline mt-2" onClick={() => refetch()}>Retry</button>
        </div>
      )}

      <section aria-live="polite">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CharacterCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center p-10 border rounded-md">
            <p className="text-lg font-medium">No results</p>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((c) => (
                <CharacterCard
                  key={c.id}
                  character={c}
                  favorite={isFavorite(c.id)}
                  onToggleFavorite={(id) => {
                    toggle(id);
                    toast.success(isFavorite(id) ? "Removed from favorites" : "Added to favorites");
                  }}
                />
              ))}
            </div>

            {!favoritesOnly && data && (
              <Pagination className="mt-8">
                <PaginationContent>
                  {page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious href={`/?${new URLSearchParams({ ...Object.fromEntries(params), page: String(Math.max(1, page - 1)) })}`}
                        onClick={(e) => { e.preventDefault(); goPage(Math.max(1, page - 1)); }} />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink isActive href={`/?${params.toString()}`}>{page}</PaginationLink>
                  </PaginationItem>
                  {data.info.next && (
                    <PaginationItem>
                      <PaginationNext href={`/?${new URLSearchParams({ ...Object.fromEntries(params), page: String(page + 1) })}`}
                        onClick={(e) => { e.preventDefault(); goPage(page + 1); }} />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default Index;
