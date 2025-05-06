"use client";

import { AddTestimonyDialog } from "@/components/spaces/add-testimony.dialog";
import { EditSpaceDialog } from "@/components/spaces/edit-space.dialog";
import { PublishTestimonyDialog } from "@/components/spaces/publish-testimony.dialog";
import { TestimonialCard } from "@/components/spaces/testimonial-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/env";
import { useTRPC } from "@/lib/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CodeBlock } from "@/components/ui/code-block";

export function SpacePage({ spaceId }: { spaceId: string }) {
  const trpc = useTRPC();
  const { data: spaceData } = useSuspenseQuery(
    trpc.space.getOne.queryOptions({ id: spaceId }),
  );
  const wallIframeUrl = `${env.NEXT_PUBLIC_APP_URL}/spaces/${spaceId}/wall?backgroundColor=F5F1EB&cardColor=fffdfa`;

  const wallEmbedCode = `<iframe
  src="${wallIframeUrl}"
  title="Testimonial Wall"
  width="100%"
  height="600px"
  loading="eager"
  style="background-color: #F5F1EB;"
></iframe>`;

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:container lg:mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 rounded-md">
            <AvatarImage src={spaceData.logo ?? ""} alt={spaceData.name} />
            <AvatarFallback className="rounded-md">
              {spaceData.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h1 className="font-semibold text-2xl">{spaceData.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <AddTestimonyDialog spaceId={spaceId} />
          <EditSpaceDialog spaceId={spaceId} />
        </div>
      </div>

      {/* Tabs for Content */}
      <Tabs defaultValue="testimonials" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
        </TabsList>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="mt-4">
          {spaceData.testimonials.length === 0 ? (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-md border p-8 text-center">
              <FolderOpen className="mb-4 h-16 w-16 text-[var(--muted-foreground)]" />
              <h2 className="mb-2 font-semibold text-[var(--foreground)] text-xl">
                No testimonials yet
              </h2>
              <p className="mb-4 text-[var(--muted-foreground)]">
                Add your first testimonial to get started.
              </p>
              <AddTestimonyDialog spaceId={spaceId} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {spaceData.testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial}>
                  {!testimonial.published && (
                    <PublishTestimonyDialog
                      testimonialId={testimonial.id}
                      testimonialText={testimonial.text}
                      spaceId={spaceId}
                    />
                  )}
                </TestimonialCard>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Widgets Tab */}
        <TabsContent value="widgets" className="mt-4 space-y-4">
          {/* Link to Iframe Test Page */}
          <div className="mb-4 rounded-md border bg-secondary p-4 text-secondary-foreground">
            <p className="text-sm">
              Want to see how the collector and wall look in an iframe?{" "}
              <Link
                href={`/sandbox/${spaceId}`}
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Test iframe embedding here
              </Link>
              .
            </p>
          </div>

          {/* Embed Wall Card */}
          <Card>
            <CardHeader>
              <CardTitle>Embed Your Wall of Love</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-[var(--muted-foreground)] text-sm">
                Copy and paste this iframe code snippet into your website's HTML
                where you want the Wall of Love to appear. This method directly
                embeds the public wall page and is self-contained.
              </p>
              <CodeBlock code={wallEmbedCode} language="html" />
              <p className="mt-4 text-[var(--muted-foreground)] text-xs">
                This iframe loads content directly from{" "}
                <code>${wallIframeUrl}</code>.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
