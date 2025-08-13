export type RMCharacter = {
  id: number;
  name: string;
  status: "Alive" | "Dead" | "unknown";
  species: string;
  type: string;
  gender: "Female" | "Male" | "Genderless" | "unknown";
  origin: { name: string; url: string };
  location: { name: string; url: string };
  image: string;
  episode: string[];
  url: string;
  created: string;
};

export type CharactersResponse = {
  info: { count: number; pages: number; next: string | null; prev: string | null };
  results: RMCharacter[];
};

const BASE = "https://rickandmortyapi.com/api";

export async function fetchCharacters(params: {
  page?: number;
  name?: string;
  status?: string;
  gender?: string;
  signal?: AbortSignal;
}): Promise<CharactersResponse> {
  const url = new URL(BASE + "/character");
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.name) url.searchParams.set("name", params.name);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.gender) url.searchParams.set("gender", params.gender);

  const res = await fetch(url.toString(), { signal: params.signal });
  if (!res.ok) {
    throw new Error(`Failed to fetch characters: ${res.status}`);
  }
  return res.json();
}

export async function fetchCharactersByIds(ids: number[], signal?: AbortSignal): Promise<RMCharacter[]> {
  if (ids.length === 0) return [];
  // API supports batching multiple IDs
  const url = new URL(BASE + "/character/" + ids.join(","));
  const res = await fetch(url.toString(), { signal });
  if (!res.ok) {
    throw new Error(`Failed to fetch favorites: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

export async function fetchCharacter(id: number, signal?: AbortSignal): Promise<RMCharacter> {
  const res = await fetch(`${BASE}/character/${id}`, { signal });
  if (!res.ok) throw new Error(`Character not found (${id})`);
  return res.json();
}
