"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useSermons } from "@/lib/hooks/useSermons";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
  sermonId: string;
  upvotes: number;
  downvotes: number;
  onVoteChange?: (upvotes: number, downvotes: number) => void;
}

export function VoteButton({
  sermonId,
  upvotes,
  downvotes,
  onVoteChange,
}: VoteButtonProps) {
  const { voteOnSermon, getUserVote } = useSermons();
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes);
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVote, setIsLoadingVote] = useState(true);

  // Fetch user's existing vote
  useEffect(() => {
    async function fetchVote() {
      const vote = await getUserVote(sermonId);
      setUserVote(vote);
      setIsLoadingVote(false);
    }
    fetchVote();
  }, [sermonId, getUserVote]);

  async function handleVote(vote: 1 | -1) {
    setIsLoading(true);

    // Optimistic update
    const wasUpvoted = userVote === 1;
    const wasDownvoted = userVote === -1;

    let newUpvotes = currentUpvotes;
    let newDownvotes = currentDownvotes;
    let newUserVote: 1 | -1 | null = vote;

    if (vote === 1) {
      if (wasUpvoted) {
        // Remove upvote
        newUpvotes--;
        newUserVote = null;
      } else {
        // Add upvote
        newUpvotes++;
        if (wasDownvoted) newDownvotes--;
      }
    } else {
      if (wasDownvoted) {
        // Remove downvote
        newDownvotes--;
        newUserVote = null;
      } else {
        // Add downvote
        newDownvotes++;
        if (wasUpvoted) newUpvotes--;
      }
    }

    setCurrentUpvotes(newUpvotes);
    setCurrentDownvotes(newDownvotes);
    setUserVote(newUserVote);
    onVoteChange?.(newUpvotes, newDownvotes);

    try {
      await voteOnSermon(sermonId, vote);
    } catch (err) {
      // Revert on error
      setCurrentUpvotes(currentUpvotes);
      setCurrentDownvotes(currentDownvotes);
      setUserVote(userVote);
      console.error("Vote failed:", err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingVote) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(1)}
        disabled={isLoading}
        className={cn(
          "gap-1 px-2",
          userVote === 1 && "text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700"
        )}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{currentUpvotes}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        className={cn(
          "gap-1 px-2",
          userVote === -1 && "text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700"
        )}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{currentDownvotes}</span>
      </Button>
    </div>
  );
}
