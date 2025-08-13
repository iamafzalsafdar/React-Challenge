import { useEffect, useState, useCallback } from "react";

const FAV_KEY = "rm_favorites";

function read(): number[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function write(ids: number[]) {
  localStorage.setItem(FAV_KEY, JSON.stringify([...new Set(ids)]));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>(() => read());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAV_KEY) setFavorites(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  const toggle = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
      write(next);
      return next;
    });
  }, []);

  return { favorites, isFavorite, toggle };
}
