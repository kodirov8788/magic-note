"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { debug } from "@/lib/debug";
import { toast } from "sonner";

interface LineCopyButtonProps {
  content: string;
  lineNumber: number;
  className?: string;
}

export default function LineCopyButton({
  content,
  lineNumber,
  className = "",
}: LineCopyButtonProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`Line ${lineNumber} copied to clipboard`);
    } catch (error) {
      toast.error("Failed to copy line");
      debug.error("ui", "LineCopyButton: Error copying line", error);
    }
  };

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className={`absolute left-0 top-0 -translate-x-8 opacity-0 transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleCopy}
      >
        <Copy className="w-3 h-3" />
      </Button>
    </div>
  );
}
