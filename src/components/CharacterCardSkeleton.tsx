import { Card } from "@/components/ui/card";

export function CharacterCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="w-full h-56 bg-muted animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-muted w-2/3 rounded animate-pulse" />
        <div className="h-4 bg-muted w-1/3 rounded animate-pulse" />
      </div>
    </Card>
  );
}
