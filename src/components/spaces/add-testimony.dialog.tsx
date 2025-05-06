"use client";

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
import { useTRPC } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, PlusIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const addTestimonySchema = z.object({
  authorName: z.string().min(1, "Your name cannot be empty"),
  text: z.string().min(1, "Your testimonial cannot be empty"),
  socialUrl: z.string().url("Please enter a valid URL"),
  imageUrl: z.string().url("Please enter a valid URL").optional(),
  position: z.string().optional(),
  companyName: z.string().optional(),
});

type AddTestimonyFormValues = z.infer<typeof addTestimonySchema>;

interface AddTestimonyDialogProps {
  spaceId: string; // Required prop to associate testimony with a space
}

export function AddTestimonyDialog({ spaceId }: AddTestimonyDialogProps) {
  const trpc = useTRPC();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const form = useForm<AddTestimonyFormValues>({
    resolver: zodResolver(addTestimonySchema),
    defaultValues: {
      text: "",
      authorName: "",
      socialUrl: "",
      imageUrl: "",
      position: "",
      companyName: "",
    },
  });

  const createTestimonialMutation = useMutation(
    trpc.space.createTestimonial.mutationOptions(),
  );

  async function onSubmit(values: AddTestimonyFormValues) {
    startTransition(async () => {
      try {
        await createTestimonialMutation.mutateAsync({
          ...values,
          spaceId,
        });
        toast.success("Testimonial added successfully");
        setIsOpen(false);
        form.reset();
        // Invalidate the query for the specific space to refresh the list
        await queryClient.invalidateQueries({
          queryKey: trpc.space.getOne.queryOptions({ id: spaceId }).queryKey,
        });
      } catch (error) {
        console.error("Failed to add testimonial:", error);
        toast.error(
          "Failed to add testimonial. Please check console for details.",
        );
      }
    });
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="mr-1.5 size-4" />
          <span>Add a text</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Text Testimonial</DialogTitle>
          <DialogDescription>
            Enter the details for the new testimonial.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="authorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                      placeholder="Enter the testimonial here..."
                      className="resize-none"
                      {...field}
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
                  <FormLabel>Social URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://twitter.com/johndoe"
                      {...field}
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
                    <Input placeholder="e.g. CEO, Founder" {...field} />
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
                    <Input placeholder="e.g. Acme Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field: { onChange, value, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Profile Picture Url</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      required
                      onChange={onChange}
                      value={value}
                      {...fieldProps}
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
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Adding
                  </>
                ) : (
                  "Add Testimonial"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
