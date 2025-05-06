import { createLoader, parseAsString } from "nuqs/server";

export const coordinatesSearchParams = {
  redirect: parseAsString,
};

export const loadSearchParams = createLoader(coordinatesSearchParams);
