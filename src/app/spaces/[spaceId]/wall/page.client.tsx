"use client";

import { Marquee } from "@/components/magicui/marquee";
import { TestimonialCard } from "@/components/spaces/testimonial-card";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_DOMAIN, APP_URL } from "@/constants";
import { useTRPC } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { MessageSquareQuote } from "lucide-react";
import Link from "next/link";
import type { WallSearchParams } from "./search-params";

function WallLoadingSkeleton({
  backgroundColor,
}: { backgroundColor?: string }) {
  return (
    <div
      className="flex h-dvh flex-col items-center justify-center space-y-4 overflow-hidden"
      style={{ backgroundColor }}
    >
      <div className="flex w-full max-w-full flex-row space-x-4 overflow-hidden py-4">
        {[...Array(5)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <div key={i} className="flex w-64 flex-shrink-0 flex-col space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
      <Skeleton className="h-4 w-48" />
    </div>
  );
}

export function WallWidget({
  spaceId,
  search,
}: {
  spaceId: string;
  search: WallSearchParams;
}) {
  const backgroundColor = search.backgroundColor
    ? `#${search.backgroundColor}`
    : undefined;
  const cardColor = search.cardColor ? `#${search.cardColor}` : undefined;
  const cardBorderColor = search.cardBorderColor
    ? `#${search.cardBorderColor}`
    : undefined;
  const cardTextColor = search.cardTextColor
    ? `#${search.cardTextColor}`
    : undefined;
  const trpc = useTRPC();

  const { data, isLoading, error } = useQuery(
    trpc.space.getWall.queryOptions({ spaceId }),
  );

  if (isLoading) {
    return <WallLoadingSkeleton backgroundColor={backgroundColor} />;
  }

  if (error || !data || data.name === "Not Found") {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        data-background-color={backgroundColor}
        style={{ backgroundColor }}
      >
        Could not load testimonials.
        {/* Removed error details for potentially public embed */}
      </div>
    );
  }

  if (data.testimonials.length === 0) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center"
        data-background-color={backgroundColor}
        style={{ backgroundColor }}
      >
        <MessageSquareQuote className="mb-4 h-12 w-12" />
        <h2 className="mb-2 font-semibold text-lg">
          No testimonials published yet.
        </h2>
      </div>
    );
  }

  return (
    <div
      className={cn("relative h-dvh space-y-4 font-sans")}
      data-background-color={backgroundColor}
      style={{
        backgroundColor: backgroundColor,
      }}
    >
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden pt-10">
        <Marquee pauseOnHover className="[--duration:20s]">
          {data.testimonials.map((t) => (
            <TestimonialCard
              className="relative w-64 cursor-pointer"
              key={t.id}
              testimonial={t}
              style={{
                backgroundColor: cardColor,
                borderColor: cardBorderColor,
                color: cardTextColor,
              }}
            />
          ))}
        </Marquee>
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background",
            "from-background",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background",
            "from-background",
          )}
        />
      </div>
      <div className="w-full text-center text-muted-foreground text-sm">
        Powered by{" "}
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={APP_URL}
          className="underline"
        >
          {APP_DOMAIN} ❤️
        </Link>
      </div>
    </div>
  );
}
