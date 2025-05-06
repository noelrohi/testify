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
import { useState } from "react";

// Define props for DeleteSpaceDialog
interface DeleteSpaceDialogProps {
  spaceId: string;
  spaceName: string;
  triggerElement: React.ReactNode; // Renamed for clarity
}

export function DeleteSpaceDialog({
  spaceId,
  spaceName,
  triggerElement, // Use the renamed prop
}: DeleteSpaceDialogProps) {
  const trpc = useTRPC();
  const [isOpen, setIsOpen] = useState(false); // State for dialog visibility
  const queryClient = useQueryClient();
  const deleteSpaceMutation = useMutation(
    trpc.space.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.space.getAll.queryOptions().queryKey,
        });
        setIsOpen(false); // Close dialog on success
        // Optionally: Add a toast notification for success
      },
      onError: (error) => {
        // Optionally: Add a toast notification for error
        console.error("Failed to delete space:", error);
        setIsOpen(false); // Also close dialog on error, or handle differently
      },
    }),
  );

  const handleDelete = () => {
    deleteSpaceMutation.mutate({ id: spaceId });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Space</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the space{" "}
            <strong>{spaceName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteSpaceMutation.isPending}
          >
            {deleteSpaceMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
