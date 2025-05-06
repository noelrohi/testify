import { z } from "zod";
import { WallWidget } from "./page.client";

type Page = {
  params: Promise<{
    spaceId: string;
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

const searchSchema = z.object({
  theme: z.enum(["light", "dark"]).default("light"),
  backgroundColor: z.string().optional(),
  cardColor: z.string().optional(),
  cardBorderColor: z.string().optional(),
  cardTextColor: z.string().optional(),
});

export type Search = z.infer<typeof searchSchema>;

export default async function Page({ params, searchParams }: Page) {
  const { spaceId } = await params;
  const search = await searchParams;
  const parsedSearch = searchSchema.parse(search);
  return <WallWidget spaceId={spaceId} search={parsedSearch} />;
}
