import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { TESTIMONIAL } from "@/server/db/schema";
import type React from "react";

interface TestimonialCardProps extends React.ComponentProps<typeof Card> {
  testimonial: typeof TESTIMONIAL.$inferSelect;
  children?: React.ReactNode; // To allow adding extra controls like publish button
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  children,
  style,
  ...props
}) => {
  // Simple logic to extract a handle-like string from URL if handle isn't provided
  const displayHandle = testimonial.socialUrl
    ? `@${testimonial.socialUrl.split("/").pop()}`
    : null;

  return (
    <Card
      key={testimonial.id}
      className={"break-inside-avoid shadow-none"}
      style={style}
      {...props}
    >
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={testimonial.photoBase64 ?? undefined}
            alt={testimonial.authorName}
          />
          <AvatarFallback>
            {testimonial.authorName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="font-semibold">{testimonial.authorName}</p>
          {testimonial.socialUrl ? (
            <a
              href={testimonial.socialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted-foreground)] text-sm hover:underline"
            >
              {displayHandle}
            </a>
          ) : displayHandle ? (
            <span className="text-[var(--muted-foreground)] text-sm">
              {displayHandle}
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-[var(--foreground)] italic">"{testimonial.text}"</p>
      </CardContent>
      {children && <CardFooter className="pt-4">{children}</CardFooter>}
    </Card>
  );
};
