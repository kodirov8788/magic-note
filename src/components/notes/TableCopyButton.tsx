"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { debug } from "@/lib/debug";
import { toast } from "sonner";

interface TableCopyButtonProps {
  content: string;
  label?: string;
  variant?: "cell" | "row";
}

export default function TableCopyButton({
  content,
  label,
  variant = "cell",
}: TableCopyButtonProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      const message = label
        ? `${label} copied to clipboard`
        : variant === "row"
        ? "Row copied to clipboard"
        : "Content copied to clipboard";
      toast.success(message);
    } catch (error) {
      toast.error("Failed to copy content");
      debug.error("ui", "TableCopyButton: Error copying content", error);
    }
  };

  if (variant === "row") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-8 px-2 text-xs"
      >
        <Copy className="w-3 h-3 mr-1" />
        Copy Row
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-6 w-6 p-0"
    >
      <Copy className="w-3 h-3" />
    </Button>
  );
}
