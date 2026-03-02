"use client";

import { useState, useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Clock, Star, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSermons } from "@/lib/hooks/useSermons";
import { SermonCard } from "@/components/sermon/SermonCard";
import { Sermon } from "@/lib/types/sermon";

export default function CommunityPage() {
  const { getCommunitySermons } = useSermons();
  const [topSermons, setTopSermons] = useState<Sermon[]>([]);
  const [recentSermons, setRecentSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSermons() {
      const [top, recent] = await Promise.all([
        getCommunitySermons("qualityScore", 20),
        getCommunitySermons("createdAt", 20),
      ]);
      setTopSermons(top);
      setRecentSermons(recent);
      setLoading(false);
    }
    fetchSermons();
  }, [getCommunitySermons]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Users className="h-8 w-8 text-seu-red" />
          Community
        </h1>
        <p className="text-muted-foreground">
          Browse top-rated sermons from the exAIgesis community
        </p>
      </div>

      <Tabs defaultValue="top" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="top" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Top Rated
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-2">
            <Clock className="h-4 w-4" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="featured" className="gap-2">
            <Star className="h-4 w-4" />
            Featured
          </TabsTrigger>
        </TabsList>

        <TabsContent value="top">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : topSermons.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Community Sermons Yet</CardTitle>
                <CardDescription>
                  Be the first to share a sermon with the community! Create a sermon and set its visibility to &quot;Community&quot; to share it here.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {topSermons.map((sermon) => (
                <SermonCard key={sermon.id} sermon={sermon} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : recentSermons.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Recent Sermons</CardTitle>
                <CardDescription>
                  Recently published sermons will appear here.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {recentSermons.map((sermon) => (
                <SermonCard key={sermon.id} sermon={sermon} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured">
          <Card>
            <CardHeader>
              <CardTitle>Featured Sermons Coming Soon</CardTitle>
              <CardDescription>
                Featured sermons selected by moderators will appear here.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
