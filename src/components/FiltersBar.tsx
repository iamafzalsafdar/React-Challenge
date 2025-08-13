import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useEffect, useMemo, useState } from "react";
import { useDebounced } from "@/hooks/use-debounce";
import { useSearchParams } from "react-router-dom";

export function FiltersBar() {
  const [params, setParams] = useSearchParams();
  const [text, setText] = useState<string>(params.get("q") ?? "");
  const debounced = useDebounced(text, 400);

  // Apply debounced search to URL
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (debounced) next.set("q", debounced); else next.delete("q");
    next.set("page", "1");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const status = params.get("status") ?? "";
  const gender = params.get("gender") ?? "";
  const sort = params.get("sort") ?? "name_asc";
  const favoritesOnly = params.get("favorites") === "1";

  const onChangeParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value && value.length) next.set(key, value); else next.delete(key);
    // Reset page when filters change
    next.set("page", "1");
    setParams(next);
  };

  const clearAll = () => {
    const keep = new URLSearchParams();
    // Keep favorites state
    if (favoritesOnly) keep.set("favorites", "1");
    setText("");
    setParams(keep);
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Search</label>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search by name…"
            aria-label="Search characters by name"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Status</label>
          <Select value={status || undefined} onValueChange={(v) => onChangeParam("status", v === "__any" ? null : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__any">Any</SelectItem>
              <SelectItem value="alive">Alive</SelectItem>
              <SelectItem value="dead">Dead</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm mb-1">Gender</label>
          <Select value={gender || undefined} onValueChange={(v) => onChangeParam("gender", v === "__any" ? null : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__any">Any</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="genderless">Genderless</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={favoritesOnly}
            onCheckedChange={(c) => onChangeParam("favorites", c ? "1" : null)}
            aria-label="Show favorites only"
          />
          <span className="text-sm">Favorites only</span>
        </div>
        <div>
          <label className="block text-sm mb-1">Sort</label>
          <Select value={sort} onValueChange={(v) => onChangeParam("sort", v)}>
            <SelectTrigger className="min-w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">Name (A → Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z → A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={clearAll}>Clear</Button>
      </div>
    </div>
  );
}
