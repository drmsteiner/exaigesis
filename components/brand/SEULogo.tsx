"use client";

import { cn } from "@/lib/utils";

interface SEULogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * SEU-branded logo for exAIgesis
 * Uses Fire Red (#CE0019) as the primary brand color
 */
export function SEULogo({
  className,
  showText = true,
  size = "md",
}: SEULogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-14",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Logo Icon - Stylized book/flame representing exegesis + AI */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(sizeClasses[size], "w-auto")}
      >
        {/* Book base */}
        <rect
          x="4"
          y="8"
          width="32"
          height="28"
          rx="2"
          fill="currentColor"
          className="text-seu-red"
        />
        {/* Book spine highlight */}
        <rect x="4" y="8" width="4" height="28" rx="1" fill="#A80015" />
        {/* Pages */}
        <rect x="10" y="12" width="22" height="2" rx="1" fill="white" />
        <rect x="10" y="17" width="18" height="2" rx="1" fill="white" />
        <rect x="10" y="22" width="20" height="2" rx="1" fill="white" />
        <rect x="10" y="27" width="16" height="2" rx="1" fill="white" />
        {/* AI spark/flame */}
        <path
          d="M30 4C30 4 32 8 32 10C32 12 30 14 28 12C26 10 28 6 30 4Z"
          fill="#CE0019"
        />
        <path
          d="M34 6C34 6 36 9 36 11C36 13 34 14 33 13C32 12 33 8 34 6Z"
          fill="#A80015"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-bold tracking-tight",
              textSizeClasses[size]
            )}
          >
            <span className="text-seu-red">ex</span>
            <span className="text-foreground">AI</span>
            <span className="text-seu-red">gesis</span>
          </span>
          {size !== "sm" && (
            <span className="text-xs text-muted-foreground font-medium tracking-wide">
              SERMON PREP AI
            </span>
          )}
        </div>
      )}
    </div>
  );
}
