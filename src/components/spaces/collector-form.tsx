import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface CollectorFormProps {
  spaceId: string;
  // TODO: Potentially fetch config like placeholders inside this component later
}

export function CollectorForm({ spaceId }: CollectorFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [text, setText] = useState("");

  const createTestimonial = useMutation(
    orpc.space.createTestimonial.mutationOptions({
      onSuccess: () => {
        // Send success message to parent window
        window.parent.postMessage({ type: "testimnCollectorSuccess" }, "*");
        // Reset form (optional, parent might close iframe immediately)
        setAuthorName("");
        setText("");
        // Optional: Show toast within iframe as fallback/confirmation
        toast.success("Thank you! Your testimonial has been submitted.");
      },
      onError: (error) => {
        // Show error toast within the iframe
        toast.error(
          `Submission failed: ${error.message}. Please try again later.`,
        );
        // Optionally, send error message to parent:
        // window.parent.postMessage({ type: "testimnCollectorError", message: error.message }, "*");
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!authorName.trim() || !text.trim()) {
      toast.error("Please fill in both your name and testimonial.");
      return;
    }
    createTestimonial.mutate({
      spaceId,
      authorName: authorName.trim(),
      text: text.trim(),
    });
  };

  const handleCancel = () => {
    // Send close message to parent window
    window.parent.postMessage({ type: "testimnCollectorClose" }, "*");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-md bg-background p-6 pt-4" // Added padding/bg
    >
      <div className="space-y-2">
        <Label htmlFor="authorName">Your Name</Label>
        <Input
          id="authorName"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Jane Doe" // TODO: Configurable placeholder?
          disabled={createTestimonial.isPending}
          required
          className="bg-input" // Ensure inputs have appropriate background
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="text">Your Testimonial</Label>
        <Textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell us about your experience..." // TODO: Configurable placeholder?
          rows={5}
          disabled={createTestimonial.isPending}
          required
          className="bg-input" // Ensure inputs have appropriate background
        />
      </div>
      {/* Recreating Footer Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={createTestimonial.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={createTestimonial.isPending}>
          {createTestimonial.isPending ? "Submitting..." : "Submit Testimonial"}{" "}
          {/* TODO: Configurable text? */}
        </Button>
      </div>
    </form>
  );
}
