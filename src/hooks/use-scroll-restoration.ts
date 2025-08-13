import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useScrollRestoration(key?: string) {
  const loc = useLocation();
  const storageKey = `scroll:${key ?? loc.pathname + loc.search}`;

  useEffect(() => {
    const y = sessionStorage.getItem(storageKey);
    if (y) {
      window.scrollTo({ top: Number(y) });
    }
    const onUnload = () => {
      sessionStorage.setItem(storageKey, String(window.scrollY));
    };
    window.addEventListener("beforeunload", onUnload);
    return () => {
      onUnload();
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [storageKey]);
}
