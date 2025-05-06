"use client";

import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CopyCollectorButtonProps {
  spaceId: string;
}

export function CopyCollectorButton({ spaceId }: CopyCollectorButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const collectorPageUrl = `${env.NEXT_PUBLIC_APP_URL}/spaces/${spaceId}/collector`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(collectorPageUrl);
      setIsCopied(true);
      toast.success("Collector link copied!");
    } catch (err) {
      toast.error("Failed to copy link.");
      console.error("Failed to copy text: ", err);
    }
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000); // Reset after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <Button
      variant="outline"
      size="sm" // Or 'icon' if you prefer just an icon
      onClick={handleCopy}
      title="Copy collector page link"
    >
      {isCopied ? (
        <Check className="mr-2 h-4 w-4 text-green-500" /> // Added margin for text
      ) : (
        <Copy className="mr-2 h-4 w-4" /> // Added margin for text
      )}
      {isCopied ? "Copied!" : "Copy Collector Link"}
    </Button>
  );
}
