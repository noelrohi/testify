import { createLoader, type inferParserType, parseAsString } from "nuqs/server";

export const wallSearchParams = {
  backgroundColor: parseAsString,
  cardColor: parseAsString,
  cardBorderColor: parseAsString,
  cardTextColor: parseAsString,
};

export type WallSearchParams = inferParserType<typeof wallSearchParams>;

export const loadSearchParams = createLoader(wallSearchParams);
