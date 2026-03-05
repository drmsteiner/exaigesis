"use client";

import { Sermon } from "@/lib/types/sermon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, ThumbsUp, Eye } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";

interface SermonCardProps {
  sermon: Sermon;
  showAuthor?: boolean;
}

export function SermonCard({ sermon, showAuthor = true }: SermonCardProps) {
  const createdAt =
    sermon.createdAt instanceof Timestamp
      ? sermon.createdAt.toDate()
      : new Date(sermon.createdAt);

  const authorInitials = sermon.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/sermons/${sermon.id}`}>
      <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-seu-red/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{sermon.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <BookOpen className="h-3 w-3" />
                <span className="scripture-ref">{sermon.scripture}</span>
              </CardDescription>
            </div>
            <Badge
              variant={
                sermon.visibility === "public"
                  ? "default"
                  : sermon.visibility === "community"
                  ? "secondary"
                  : "outline"
              }
              className="ml-2"
            >
              {sermon.visibility}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Content preview */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {sermon.content.slice(0, 200)}
            {sermon.content.length > 200 && "..."}
          </p>

          {/* Tags */}
          {sermon.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {sermon.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {sermon.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{sermon.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            {/* Author */}
            {showAuthor && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-seu-red text-white">
                    {authorInitials}
                  </AvatarFallback>
                </Avatar>
                <span>{sermon.authorName}</span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                {sermon.upvotes}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {sermon.viewCount}
              </span>
              <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
