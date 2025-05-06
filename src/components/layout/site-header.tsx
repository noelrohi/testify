"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function SiteHeader() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const handleLogout = () => {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    });
  };
  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="flex h-14 items-center justify-between px-4 lg:container lg:mx-auto">
    <div className="flex items-center gap-4">
      <img src={"/favicon.ico"} alt="Trustify" className="h-8" />
      <h1 className="font-semibold text-2xl text-foreground tracking-tight">
        Trustify
      </h1>
    </div>
    <div>
      <Button onClick={handleLogout} variant="outline" disabled={isPending}>
        {isPending ? "Logging out..." : "Logout"}
      </Button>
    </div>
  </div>
</header>;
}