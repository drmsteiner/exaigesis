"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Clock, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CommunityPage() {
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
          <Card>
            <CardHeader>
              <CardTitle>No Community Sermons Yet</CardTitle>
              <CardDescription>
                Be the first to share a sermon with the community! Create a sermon and set its visibility to &quot;Community&quot; to share it here.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>No Recent Sermons</CardTitle>
              <CardDescription>
                Recently published sermons will appear here.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="featured">
          <Card>
            <CardHeader>
              <CardTitle>No Featured Sermons</CardTitle>
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
