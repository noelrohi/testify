import { db } from "@/server/db";
import { Dashboard } from "../_components/dashboard";

export default async function Home() {
  const spaces = await db.query.SPACE.findMany({
    with: {
      testimonials: true,
    },
  });
  return <Dashboard spaces={spaces} />;
}
