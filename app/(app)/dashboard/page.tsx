"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, MessageSquare, Sparkles, Library, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.displayName?.split(" ")[0] || "there"}
        </h1>
        <p className="text-muted-foreground">
          Start preparing your next sermon with AI assistance
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/prep">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-seu-red group">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-seu-red-light flex items-center justify-center mb-2 group-hover:bg-seu-red transition-colors">
                <Sparkles className="h-6 w-6 text-seu-red group-hover:text-white transition-colors" />
              </div>
              <CardTitle>New Sermon Prep</CardTitle>
              <CardDescription>
                Start a new AI-assisted sermon preparation session
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/sermons/my">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>My Sermons</CardTitle>
              <CardDescription>
                View and manage your saved sermons
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/community">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>Community</CardTitle>
              <CardDescription>
                Browse top-rated sermons from the community
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/sources">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2">
                <Library className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>External Sources</CardTitle>
              <CardDescription>
                Connect commentaries, lexicons, and more
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Your Stats
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-seu-red">{profile?.sermonCount || 0}</div>
            <p className="text-sm text-muted-foreground">Sermons Created</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-seu-red">{profile?.totalUpvotes || 0}</div>
            <p className="text-sm text-muted-foreground">Total Upvotes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-seu-red">{profile?.externalSources?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Connected Sources</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
