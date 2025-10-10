import * as React from "react";

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

function SkeletonNoteCard() {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="space-y-3">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

function SkeletonSidebarItem() {
  return (
    <div className="flex items-center space-x-3 rounded-lg p-2">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonNoteCard, SkeletonSidebarItem };
