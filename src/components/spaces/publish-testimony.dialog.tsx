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
import { useTRPC } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface PublishTestimonyDialogProps {
  testimonialId: string;
  testimonialText: string;
  spaceId: string;
  triggerButton?: React.ReactNode; // Optional custom trigger
}

export function PublishTestimonyDialog({
  testimonialId,
  testimonialText,
  spaceId,
  triggerButton,
}: PublishTestimonyDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const publishMutation = useMutation(
    trpc.space.publishTestimonial.mutationOptions(),
  );

  const handlePublish = () => {
    startTransition(async () => {
      try {
        await publishMutation.mutateAsync({ id: testimonialId });
        toast.success("Testimonial published!");
        queryClient.invalidateQueries({
          queryKey: trpc.space.getOne.queryOptions({ id: spaceId }).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: trpc.space.getAll.queryOptions().queryKey,
        });
        setIsOpen(false);
      } catch (error) {
        console.error("Failed to publish testimonial:", error);
        toast.error(
          `Failed to publish: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button size="sm" variant="outline">
            Publish
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish Testimonial?</DialogTitle>
          <DialogDescription>
            Are you sure you want to publish this testimonial? It will become
            visible on your public Wall of Love.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 rounded border bg-muted/40 p-4 text-sm italic">
          "{testimonialText}"
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={isPending}>
            {isPending ? "Publishing..." : "Confirm Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
