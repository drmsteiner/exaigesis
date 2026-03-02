"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSermons } from "@/lib/hooks/useSermons";
import { SermonCard } from "@/components/sermon/SermonCard";
import { Sermon } from "@/lib/types/sermon";

export default function MySermonsPage() {
  const { getMySermons } = useSermons();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSermons() {
      const data = await getMySermons();
      setSermons(data);
      setLoading(false);
    }
    fetchSermons();
  }, [getMySermons]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-seu-red" />
            My Sermons
          </h1>
          <p className="text-muted-foreground">
            View and manage your saved sermons
          </p>
        </div>
        <Link href="/sermons/new">
          <Button className="bg-seu-red hover:bg-seu-red-hover">
            <Plus className="mr-2 h-4 w-4" />
            New Sermon
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : sermons.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Sermons Yet</CardTitle>
            <CardDescription>
              Start your first sermon prep session to see your sermons here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/sermons/new">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Sermon
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {sermons.map((sermon) => (
            <SermonCard key={sermon.id} sermon={sermon} showAuthor={false} />
          ))}
        </div>
      )}
    </div>
  );
}
