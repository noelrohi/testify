import { api } from "@/trpc/server";
import type { Metadata } from "next";
import { SpacePage } from "../_components/_spaces.$id";

type Page = {
  params: Promise<{
    spaceId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Space",
};

export default async function Page({ params }: Page) {
  const { spaceId } = await params;
  await api.space.getOne.prefetch({ id: spaceId });
  return <SpacePage spaceId={spaceId} />;
}
