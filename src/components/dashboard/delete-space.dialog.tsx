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
// import { useQueryClient } from "@tanstack/react-query";
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
  const [isOpen, setIsOpen] = useState(false); // State for dialog visibility
  // const queryClient = useQueryClient();
  // const deleteSpaceMutation = useMutation(
  //   orpc.space.delete.mutationOptions({
  //     onSuccess: () => {
  //       queryClient.invalidateQueries({
  //         queryKey: orpc.space.getAll.queryOptions().queryKey,
  //       });
  //       setIsOpen(false); // Close dialog on success
  //       // Optionally: Add a toast notification for success
  //     },
  //     onError: (error) => {
  //       // Optionally: Add a toast notification for error
  //       console.error("Failed to delete space:", error);
  //       setIsOpen(false); // Also close dialog on error, or handle differently
  //     },
  //   }),
  // );

  const handleDelete = () => {
    // deleteSpaceMutation.mutate({ id: spaceId });
  };

  return (
    // Use Dialog component
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Use DialogTrigger */}
      <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      {/* Use DialogContent */}
      <DialogContent>
        {/* Use DialogHeader, DialogTitle, DialogDescription */}
        <DialogHeader>
          <DialogTitle>Delete Space</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the space{" "}
            <strong>{spaceName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {/* Use DialogFooter */}
        <DialogFooter>
          {/* Regular Button for Cancel */}
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          {/* Regular Button for Delete Action */}
          <Button
            // variant="destructive" // Use destructive variant if available
            className="bg-red-600 text-white hover:bg-red-700" // Keep destructive styling
            onClick={handleDelete}
            // disabled={deleteSpaceMutation.isPending}
          >
            {/* {deleteSpaceMutation.isPending ? "Deleting..." : "Delete"} */}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
