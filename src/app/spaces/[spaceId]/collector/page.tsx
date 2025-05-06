import type { SearchParams } from "nuqs/server";
import { SpaceCollectPage } from "./page.client";
import { loadSearchParams } from "./search-params";
import { api } from "@/trpc/server";

type PageProps = {
  params: Promise<{
    spaceId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const spaceId = (await params).spaceId;
  const { redirect } = await loadSearchParams(searchParams);
  await api.space.getCollectorConfig.prefetch({ spaceId });

  return <SpaceCollectPage spaceId={spaceId} redirect={redirect} />;
}
