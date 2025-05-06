"use client";
import { CreateSpaceDialog } from "@/components/dashboard/create-space.dialog";
import { DeleteSpaceDialog } from "@/components/dashboard/delete-space.dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SPACE, TESTIMONIAL } from "@/server/db/schema/space";
import { Ellipsis, FolderPlus, Sparkles } from "lucide-react";
import Link from "next/link";

type Space = typeof SPACE.$inferSelect;

export interface SpaceWithTestimonials extends Space {
  testimonials: (typeof TESTIMONIAL.$inferSelect)[];
}

export function Dashboard({ spaces }: { spaces: SpaceWithTestimonials[] }) {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:container lg:mx-auto">
      <div className="space-y-8">
        <section>
          <h1 className="mb-4 font-semibold text-2xl tracking-tight">
            Overview
          </h1>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  Total Spaces
                </CardTitle>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{spaces?.length ?? 0}</div>
              </CardContent>
            </Card>
          </div>
        </section>
        <section>
          {!spaces || spaces.length === 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-xl tracking-tight">Spaces</h2>
              </div>
              <div className="col-span-full flex h-[calc(100vh-400px)] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <FolderPlus className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="mb-2 font-semibold text-xl tracking-tight">
                  No spaces yet
                </h2>
                <p className="mb-4 text-muted-foreground text-sm">
                  Create your first space to start collecting testimonials
                </p>
                <CreateSpaceDialog />
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-xl tracking-tight">Spaces</h2>
                <CreateSpaceDialog />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {spaces?.map((space) => (
                  <Card key={space.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        {" "}
                        {/* Added overflow-hidden */}
                        <img
                          src={space.logo ?? "/placeholder-image.svg"} // Added fallback
                          alt={`${space.name} thumbnail`}
                          className="h-8 w-8 flex-shrink-0 rounded-sm object-cover" // Added flex-shrink-0
                        />
                        <CardTitle className="truncate font-medium text-sm">
                          {" "}
                          {/* Added truncate */}
                          {space.name}
                        </CardTitle>
                      </div>
                      {/* --- Dropdown Menu --- */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Ellipsis className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* <DropdownMenuItem
                        // onClick={() => console.log("Edit", space.id)} // Placeholder for Edit
                        >
                          Edit
                        </DropdownMenuItem> */}
                          {/* Use DeleteSpaceDialog */}
                          <DropdownMenuItem asChild>
                            <Link href={`/${space.id}`}>View Space</Link>
                          </DropdownMenuItem>
                          <DeleteSpaceDialog
                            spaceId={space.id}
                            spaceName={space.name}
                            // Pass the trigger element explicitly
                            triggerElement={
                              <DropdownMenuItem
                                data-variant="destructive"
                                // Prevent closing menu when clicking item, DialogTrigger handles opening
                                onSelect={(e) => e.preventDefault()}
                              >
                                Delete
                              </DropdownMenuItem>
                            }
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {/* --- End Dropdown Menu --- */}
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-xs">
                      {/* Ensure testimonials exist before accessing length */}
                      <p>Testimonials: {space.testimonials?.length ?? 0}</p>
                      {/* Display custom message if available */}
                      {space.customMessage && (
                        <p className="mt-1 truncate">{space.customMessage}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
