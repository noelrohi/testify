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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react"; // Changed icon
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const editSpaceSchema = z.object({
  name: z.string().min(1, "Space name cannot be empty"),
  customMessage: z.string(),
  logo: z.string().optional(),
});

type EditSpaceFormValues = z.infer<typeof editSpaceSchema>;

interface EditSpaceDialogProps {
  spaceId: string; // Required prop to know which space to edit
  trigger?: React.ReactNode; // Optional custom trigger
}

export function EditSpaceDialog({ spaceId, trigger }: EditSpaceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  // Fetch existing space data
  const { data: spaceData, isLoading: isLoadingSpace } = useQuery(
    trpc.space.getOne.queryOptions({ id: spaceId }),
  );

  const form = useForm<EditSpaceFormValues>({
    resolver: zodResolver(editSpaceSchema),
    defaultValues: {
      name: "",
      customMessage: "",
      logo: "",
    },
  });

  // Pre-populate form when data loads and dialog opens
  useEffect(() => {
    if (spaceData && isOpen) {
      form.reset({
        name: spaceData.name,
        customMessage: spaceData.customMessage ?? "",
        logo: spaceData.logo ?? "",
      });
      setLogoPreview(spaceData.logo ?? null);
    }
    // Reset form if dialog closes or spaceData becomes unavailable
    if (!isOpen) {
      form.reset({ name: "", customMessage: "", logo: "" });
      setLogoPreview(null);
    }
  }, [spaceData, form, isOpen]);

  const editSpaceMutation = useMutation(trpc.space.edit.mutationOptions());

  async function onSubmit(values: EditSpaceFormValues) {
    startTransition(async () => {
      try {
        await editSpaceMutation.mutateAsync({
          id: spaceId, // Pass spaceId to the mutation
          logo: values.logo,
          name: values.name,
          customMessage: values.customMessage,
        });
        toast.success("Space updated successfully");
        setIsOpen(false);
        // Invalidate queries related to this space and the list of spaces
        queryClient.invalidateQueries({
          queryKey: trpc.space.getOne.queryOptions({ id: spaceId }).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: trpc.space.getAll.queryOptions().queryKey,
        });
        // No need to reset form here, useEffect handles it on close
      } catch (error) {
        toast.error("Failed to update space");
      }
    });
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        // Reset handled by useEffect
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="secondary" size="sm">
            <Pencil className="mr-2 size-4" /> Edit Space
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Space</DialogTitle>
          <DialogDescription>
            Update the details for your space.
          </DialogDescription>
        </DialogHeader>
        {isLoadingSpace ? (
          <div>Loading space details...</div> // Show loading state
        ) : (
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
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    // Note: We don't pre-select the file input for security reasons.
                    // The user must re-select if they want to change it.
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64String = reader.result as string;
                          form.setValue("logo", base64String, {
                            shouldDirty: true,
                          }); // Mark as dirty on change
                          setLogoPreview(base64String);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        // If selection is cancelled, revert to original or clear
                        // Reverting might be complex, let's clear for now or keep existing if user cancels
                        // Let's keep the existing logo if they cancel selection
                        const currentLogo = form.getValues("logo");
                        setLogoPreview(currentLogo || null);
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Upload a new image to replace the current logo (Max 5MB: JPG,
                  PNG, WEBP).
                </FormDescription>
                <FormMessage />
                {logoPreview && (
                  <div className="mt-2">
                    <p className="mb-1 text-muted-foreground text-sm">
                      Current Logo Preview:
                    </p>
                    <Avatar className="h-20 w-20 rounded-sm">
                      <AvatarImage src={logoPreview} alt="Logo preview" />
                      <AvatarFallback className="rounded-sm">
                        {form.getValues("name")?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </FormItem>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)} // Only close the dialog
                  disabled={isPending}
                >
                  {isPending ? "Cancelling..." : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !form.formState.isDirty}
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
