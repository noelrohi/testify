"use client";

export function ScriptEmbedTestPage({ spaceId }: { spaceId: string }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 lg:container lg:mx-auto">
      <div className="space-y-8">
        <h1 className="mb-4 font-bold text-2xl font-display">
          Embed Sandbox Test
        </h1>

        <div>
          <h2 className="mb-2 font-semibold text-xl font-display">
            Wall of Love (via Iframe)
          </h2>
          <p className="mb-2 text-muted-foreground text-sm">
            This directly embeds the public wall page.
          </p>
          <iframe
            src={`/spaces/${spaceId}/wall`}
            title={`Testimonial Wall for ${spaceId}`}
            width="100%"
            height="250px"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}
