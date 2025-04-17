import { Suspense } from "react";
import BannedClientPage from "@/components/banned-members-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function BannedPage() {
  return (
    <Suspense fallback={<BannedPageSkeleton />}>
      <BannedClientPage />
    </Suspense>
  );
}

function BannedPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        <div className="flex space-x-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
          <Skeleton className="h-8 w-24" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-12 w-full" />
            ))}
            <Skeleton className="h-12 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
