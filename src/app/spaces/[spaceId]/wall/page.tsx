import type { SearchParams } from "nuqs/server";
import { z } from "zod";
import { WallWidget } from "./page.client";
import { loadSearchParams } from "./search-params";

type Page = {
  params: Promise<{
    spaceId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function Page({ params, searchParams }: Page) {
  const { spaceId } = await params;
  const search = await loadSearchParams(searchParams);
  return <WallWidget spaceId={spaceId} search={search} />;
}
