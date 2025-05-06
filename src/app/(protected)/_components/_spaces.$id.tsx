"use client";

import { AddTestimonyDialog } from "@/components/spaces/add-testimony.dialog";
import { EditSpaceDialog } from "@/components/spaces/edit-space.dialog";
import { PublishTestimonyDialog } from "@/components/spaces/publish-testimony.dialog";
import { TestimonialCard } from "@/components/spaces/testimonial-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/env";
import { useTRPC } from "@/lib/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FolderOpen, Copy as CopyIcon, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const testify_sdk_usage = (
  spaceId: string,
) => `import { Testify } from "@trytestify/sdk";

const testify = new Testify();

async function run() {
  const result = await testify.testimonials.get({
    spaceId: "${spaceId}",
  });

  // Handle the result (e.g., display testimonials)
  console.log(result);
  if (result.testimonials) {
    // Process result.testimonials array
  }
}

run();`;

export function SpacePage({ spaceId }: { spaceId: string }) {
  const trpc = useTRPC();
  const { data: spaceData } = useSuspenseQuery(
    trpc.space.getOne.queryOptions({ id: spaceId }),
  );
  const wallIframeUrl = `${env.NEXT_PUBLIC_APP_URL}/spaces/${spaceId}/wall?backgroundColor=F5F1EB&cardColor=fffdfa`;
  const collectorPageUrl = `${env.NEXT_PUBLIC_APP_URL}/spaces/${spaceId}/collector`;

  const wallEmbedCode = `<iframe
  src="${wallIframeUrl}"
  title="Testimonial Wall"
  width="100%"
  height="600px"
  loading="eager"
  style="background-color: #F5F1EB;"
></iframe>`;

  const [isCopiedCollectorUrl, setIsCopiedCollectorUrl] = useState(false);

  const handleCollectorUrlCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopiedCollectorUrl(true);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy.");
    }
  };

  useEffect(() => {
    if (isCopiedCollectorUrl) {
      const timer = setTimeout(() => setIsCopiedCollectorUrl(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopiedCollectorUrl]);

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
          <TabsTrigger value="snippets">Snippets</TabsTrigger>
        </TabsList>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="mt-4">
          {spaceData.testimonials.length === 0 ? (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-md border p-8 text-center">
              <FolderOpen className="mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 font-semibold text-foreground text-xl">
                No testimonials yet
              </h2>
              <p className="mb-4 text-muted-foreground">
                Add your first testimonial to get started.
              </p>
              <AddTestimonyDialog spaceId={spaceId} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {spaceData.testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial}>
                  {!testimonial.isPublished && (
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

        {/* Snippets Tab */}
        <TabsContent value="snippets" className="mt-4 space-y-4">
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

          {/* Collector Page Link Card */}
          <Card>
            <CardHeader>
              <CardTitle>Collector Page Link</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground text-sm">
                Share this link with your users to collect testimonials.
              </p>
              <div className="flex items-center space-x-2 rounded-md border bg-muted p-3">
                <Link
                  href={collectorPageUrl}
                  target="_blank"
                  className="flex-grow truncate text-sm font-medium text-primary hover:underline"
                >
                  {collectorPageUrl}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCollectorUrlCopy(collectorPageUrl)}
                  title="Copy collector page link"
                >
                  {isCopiedCollectorUrl ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="mt-4 text-muted-foreground text-xs">
                This link directs users to the testimonial submission form for
                this space.
              </p>
            </CardContent>
          </Card>

          {/* Embed Wall Card */}
          <Card>
            <CardHeader>
              <CardTitle>Embed Your Wall of Love</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground text-sm">
                Copy and paste this iframe code snippet into your website's HTML
                where you want the Wall of Love to appear. This method directly
                embeds the public wall page and is self-contained.
              </p>
              <CodeBlock code={wallEmbedCode} language="html" />
              <p className="mt-4 text-muted-foreground text-xs">
                This iframe loads content directly from{" "}
                <code>${wallIframeUrl}</code>.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SDK Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground text-sm">
                Use our SDK to fetch and display testimonials directly in your
                application.
              </p>
              <CodeBlock
                code={testify_sdk_usage(spaceId)}
                language="typescript"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
