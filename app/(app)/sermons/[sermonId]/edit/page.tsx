"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSermonRealtime } from "@/lib/hooks/useSermons";
import { useAuth } from "@/lib/hooks/useAuth";
import { SermonEditor } from "@/components/sermon/SermonEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditSermonPage() {
  const params = useParams();
  const router = useRouter();
  const sermonId = params.sermonId as string;
  const { user } = useAuth();
  const { sermon, loading } = useSermonRealtime(sermonId);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && sermon && user) {
      setIsAuthorized(user.uid === sermon.authorId);
    } else if (!loading && !sermon) {
      setIsAuthorized(false);
    }
  }, [loading, sermon, user]);

  if (loading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sermon || !isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {!sermon ? "Sermon Not Found" : "Not Authorized"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {!sermon
                ? "This sermon doesn't exist."
                : "You don't have permission to edit this sermon."}
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Edit className="h-8 w-8 text-seu-red" />
          Edit Sermon
        </h1>
        <p className="text-muted-foreground">
          Make changes to your sermon
        </p>
      </div>

      <SermonEditor
        sermonId={sermonId}
        initialData={{
          title: sermon.title,
          scripture: sermon.scripture,
          content: sermon.content,
          outline: sermon.outline,
          visibility: sermon.visibility,
          tags: sermon.tags,
        }}
        onSave={() => router.push(`/sermons/${sermonId}`)}
      />
    </div>
  );
}
