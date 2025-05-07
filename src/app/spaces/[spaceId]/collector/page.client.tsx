"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { APP_DOMAIN, APP_NAME, APP_URL, GITHUB_REPO_URL } from "@/constants";
import { useTRPC } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { FileText, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Define Zod schema for form validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const formSchema = z.object({
  authorName: z.string().min(1, { message: "Name is required." }),
  text: z.string().min(1, { message: "Testimonial text is required." }),
  socialUrl: z.string().url({ message: "Please enter a valid URL." }),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional(),
  position: z.string().optional(),
  companyName: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function SpaceCollectPage({
  spaceId,
  redirect,
}: {
  spaceId: string;
  redirect: string | null;
}) {
  const trpc = useTRPC();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      authorName: "",
      text: "",
      socialUrl: "",
      position: "",
      companyName: "",
    },
  });

  const { data: spaceData } = useSuspenseQuery({
    ...trpc.space.getCollectorConfig.queryOptions({
      spaceId: spaceId,
    }),
  });

  const createTestimonial = useMutation({
    ...trpc.space.createTestimonial.mutationOptions(), // Use spread for options
    onSuccess: () => {
      toast.success("Thank you! Your testimonial has been submitted.");
      setIsOpen(false);
      form.reset(); // Reset form using react-hook-form method
    },
    onError: (error) => {
      toast.error(
        `Submission failed: ${error.message}. Please try again later.`,
      );
    },
  });

  // Updated onSubmit handler for react-hook-form
  const onSubmit = async (values: FormData) => {
    if (!spaceId) {
      toast.error("Space ID is missing.");
      return; // Should not happen if route is matched
    }

    createTestimonial.mutate({
      spaceId,
      authorName: values.authorName.trim(),
      text: values.text.trim(),
      socialUrl: values.socialUrl,
      imageUrl: values.imageUrl?.trim() || undefined,
      position: values.position?.trim() || undefined,
      companyName: values.companyName?.trim() || undefined,
    });
  };

  return (
    <div className="container mx-auto flex min-h-dvh max-w-3xl flex-col p-4 py-8">
      {/* 1. Header (Top Left) */}
      <div className="flex w-full items-center justify-start mb-8">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-2xl text-foreground tracking-tight font-display">
            Testify
          </h1>
        </div>
      </div>

      {/* Centered Content Area */}
      <div className="flex flex-grow flex-col items-center justify-start space-y-6 pt-4">
        {/* Avatar */}
        <Avatar className="h-24 w-24">
          <AvatarImage
            src={spaceData.logo || undefined}
            alt={spaceData.name || "Space"}
            className="object-cover"
          />
          <AvatarFallback>
            {spaceData.name?.charAt(0).toUpperCase() || "S"}
          </AvatarFallback>
        </Avatar>

        {/* Title */}
        <h2 className="text-center font-bold text-4xl mt-4">
          {spaceData.name}
        </h2>

        {/* Questions Section */}
        <div className="w-full max-w-md pt-8 pb-4 self-start md:self-center md:pl-0">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground mb-3">
            Question
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>{spaceData.customMessage}</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) form.reset(); // Reset form on close
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                disabled={
                  form.formState.isSubmitting || createTestimonial.isPending
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                Send in text
              </Button>
            </DialogTrigger>
            <DialogContent className="z-[9999] sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Submit Your Testimonial</DialogTitle>
                <DialogDescription>
                  Share your experience with {spaceData.name || "us"}. Click
                  submit when you're done. Photo is required.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 pt-4"
                >
                  <FormField
                    control={form.control}
                    name="authorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Jane Doe"
                            {...field}
                            disabled={
                              form.formState.isSubmitting ||
                              createTestimonial.isPending
                            }
                            autoComplete="name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Testimonial</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your experience..."
                            rows={5}
                            {...field}
                            disabled={
                              form.formState.isSubmitting ||
                              createTestimonial.isPending
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Profile URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://linkedin.com/in/janedoe"
                            type="url"
                            {...field}
                            disabled={
                              form.formState.isSubmitting ||
                              createTestimonial.isPending
                            }
                            autoComplete="url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Software Engineer"
                            {...field}
                            disabled={
                              form.formState.isSubmitting ||
                              createTestimonial.isPending
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Tech Solutions Inc."
                            {...field}
                            disabled={
                              form.formState.isSubmitting ||
                              createTestimonial.isPending
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Profile Picture URL (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="url"
                            placeholder="https://github.com/shadcn.png"
                            value={value}
                            onChange={onChange}
                            disabled={
                              form.formState.isSubmitting ||
                              createTestimonial.isPending
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsOpen(false);
                        form.reset();
                      }}
                      disabled={
                        form.formState.isSubmitting ||
                        createTestimonial.isPending
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        form.formState.isSubmitting ||
                        createTestimonial.isPending
                      }
                    >
                      {form.formState.isSubmitting ||
                      createTestimonial.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Submitting...
                        </>
                      ) : (
                        "Submit Testimonial"
                      )}{" "}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Optional Redirect Button - Can be kept or removed */}
        {redirect && (
          <Button
            type="button"
            variant="link"
            onClick={() => {
              window.open(redirect, "_blank");
            }}
          >
            Go back to your website
          </Button>
        )}

        {/* 6. Powered by */}
        <div className="mt-auto pt-8 text-muted-foreground text-xs">
          Powered by{" "}
          <Link
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {APP_NAME} ❤️
          </Link>
        </div>
      </div>
    </div>
  );
}
