import { api } from "@/trpc/server";
import type { Metadata } from "next";
import { Dashboard } from "../_components/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function Home() {
  await api.space.getAll.prefetch();
  return <Dashboard />;
}
