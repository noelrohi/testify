import type { Metadata } from "next";
import { ScriptEmbedTestPage } from "./page.client";

type Page = {
  params: Promise<{
    spaceId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Sandbox",
};

export default async function Page({ params }: Page) {
  const { spaceId } = await params;
  return <ScriptEmbedTestPage spaceId={spaceId} />;
}
