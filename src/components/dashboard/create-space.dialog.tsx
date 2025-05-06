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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/lib/trpc";
// import { orpc } from "@/utils/orpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const createSpaceSchema = z.object({
  name: z.string().min(1, "Space name cannot be empty"),
  customMessage: z.string(),
  logo: z.string().optional(),
});

type CreateSpaceFormValues = z.infer<typeof createSpaceSchema>;

export function CreateSpaceDialog() {
  const trpc = useTRPC();
  const [isOpen, setIsOpen] = useState(false); // Control dialog open state
  const [logoPreview, setLogoPreview] = useState<string | null>(null); // State for logo preview
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const form = useForm<CreateSpaceFormValues>({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: {
      name: "",
      customMessage: "",
    },
  });
  const createSpaceMutation = useMutation(trpc.space.create.mutationOptions());

  // const createSpaceMutation = useMutation(orpc.space.create.mutationOptions());

  async function onSubmit(values: CreateSpaceFormValues) {
    startTransition(async () => {
      try {
        const result = await createSpaceMutation.mutateAsync({
          logo: values.logo,
          name: values.name,
          customMessage: values.customMessage,
        });
        toast.success("Space created successfully");
        setIsOpen(false);
        form.reset();
        queryClient.invalidateQueries({
          queryKey: trpc.space.getAll.queryOptions().queryKey,
        });
        setLogoPreview(null);
      } catch (error) {
        toast.error("Failed to create space");
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
          setLogoPreview(null); // Reset preview on close
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create a new space
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new space</DialogTitle>
          <DialogDescription>
            Give your space a name. You can add more details later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Space Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about this space"
                      className="resize-none"
                      {...field}
                      // Ensure value is not null/undefined for Textarea
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Thumbnail</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64String = reader.result as string;
                        form.setValue("logo", base64String);
                        setLogoPreview(base64String); // Set preview
                      };
                      reader.readAsDataURL(file);
                      // form.setValue("thumbnail", convertFileToBase64(file)); // Keep this if convertFileToBase64 is async and returns base64 directly
                    } else {
                      // Handle case where file selection is cancelled
                      form.setValue("logo", ""); // Clear form value
                      setLogoPreview(null); // Clear preview
                    }
                  }}
                />
              </FormControl>
              <FormDescription>
                Upload an image for your space (Max 5MB: JPG, PNG, WEBP).
              </FormDescription>
              <FormMessage />
              {/* Display Thumbnail Preview */}
              {logoPreview && (
                <div className="mt-2">
                  <Avatar className="h-20 w-20 rounded-sm">
                    <AvatarImage src={logoPreview} alt="Thumbnail preview" />
                    <AvatarFallback className="rounded-sm">?</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </FormItem>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  form.reset(); // Reset form on cancel
                  setLogoPreview(null); // Reset preview on cancel
                }}
                disabled={isPending}
              >
                {isPending ? "Cancelling..." : "Cancel"}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Space"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
