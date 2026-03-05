"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSermons, useSermonRealtime } from "@/lib/hooks/useSermons";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VoteButton } from "@/components/sermon/VoteButton";
import {
  BookOpen,
  Edit,
  Trash2,
  ArrowLeft,
  Eye,
  Calendar,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function SermonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sermonId = params.sermonId as string;
  const { user } = useAuth();
  const { sermon, loading } = useSermonRealtime(sermonId);
  const { deleteSermon } = useSermons();
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user && sermon && user.uid === sermon.authorId;

  const createdAt =
    sermon?.createdAt instanceof Timestamp
      ? sermon.createdAt.toDate()
      : sermon?.createdAt
      ? new Date(sermon.createdAt)
      : null;

  const authorInitials = sermon?.authorName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  async function handleDelete() {
    if (!sermon?.id) return;
    setIsDeleting(true);
    try {
      await deleteSermon(sermon.id);
      toast.success("Sermon deleted");
      router.push("/sermons/my");
    } catch {
      toast.error("Failed to delete sermon");
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sermon) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Sermon Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This sermon doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
            <Link href="/sermons/my">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Sermons
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{sermon.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-2 scripture-ref">
                <BookOpen className="h-4 w-4" />
                {sermon.scripture}
              </span>
              <Badge
                variant={
                  sermon.visibility === "public"
                    ? "default"
                    : sermon.visibility === "community"
                    ? "secondary"
                    : "outline"
                }
              >
                {sermon.visibility}
              </Badge>
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2">
              <Link href={`/sermons/${sermon.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Sermon?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your sermon.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>

      {/* Meta info */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Author */}
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-seu-red text-white">
                  {authorInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{sermon.authorName}</p>
                <p className="text-sm text-muted-foreground">Author</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{sermon.viewCount} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {createdAt ? format(createdAt, "MMM d, yyyy") : "Unknown"}
                </span>
              </div>
              <VoteButton
                sermonId={sermon.id!}
                upvotes={sermon.upvotes}
                downvotes={sermon.downvotes}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {sermon.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {sermon.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Outline */}
      {sermon.outline && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Outline</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg">
              {sermon.outline}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sermon Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {sermon.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
