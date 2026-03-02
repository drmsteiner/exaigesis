"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEULogo } from "@/components/brand/SEULogo";
import { useRouter } from "next/navigation";
import { BookOpen, MessageSquare, Settings, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, profile, signOut, loading } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <SEULogo size="lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <SEULogo size="md" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{profile?.displayName || user.email}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Start preparing your next sermon with AI assistance
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/prep">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-seu-red">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-seu-red-light flex items-center justify-center mb-2">
                  <Sparkles className="h-6 w-6 text-seu-red" />
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
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{profile?.sermonCount || 0}</div>
              <p className="text-sm text-muted-foreground">Sermons Created</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{profile?.totalUpvotes || 0}</div>
              <p className="text-sm text-muted-foreground">Total Upvotes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{profile?.externalSources?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Connected Sources</p>
            </CardContent>
          </Card>
        </div>

        {/* Settings Link */}
        <div className="mt-8">
          <Link href="/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
