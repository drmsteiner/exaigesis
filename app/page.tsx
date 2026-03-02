import { SEULogo } from "@/components/brand/SEULogo";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, MessageSquare, Users, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <SEULogo size="md" />
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-seu-red hover:bg-seu-red-hover text-white">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Content */}
      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              AI-Powered{" "}
              <span className="text-seu-red">Sermon Preparation</span>
            </h1>
            <p className="font-accent text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Combine biblical scholarship, community wisdom, and intelligent
              assistance to prepare sermons that transform lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-seu-red hover:bg-seu-red-hover text-white text-lg px-8"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Preparing
                </Button>
              </Link>
              <Link href="/community">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  <Users className="mr-2 h-5 w-5" />
                  Browse Community
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-muted">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              How <span className="text-seu-red">exAIgesis</span> Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-seu-red" />
                  </div>
                  <CardTitle>Connect Your Sources</CardTitle>
                  <CardDescription>
                    Plug in commentaries, lexicons, devotionals, and theological
                    resources for the AI to reference.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-seu-red" />
                  </div>
                  <CardTitle>Chat with AI</CardTitle>
                  <CardDescription>
                    Have a conversation about your passage. Get insights,
                    outlines, illustrations, and applications.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-seu-red" />
                  </div>
                  <CardTitle>Learn from Community</CardTitle>
                  <CardDescription>
                    Browse sermons from fellow ministers. Upvote quality content
                    so the best rises to the top.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Scripture Quote Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <blockquote className="font-accent text-2xl md:text-3xl text-muted-foreground italic mb-4">
              &ldquo;Do your best to present yourself to God as one approved, a
              worker who does not need to be ashamed and who correctly handles
              the word of truth.&rdquo;
            </blockquote>
            <cite className="scripture-ref text-lg text-seu-red">
              2 Timothy 2:15 (NIV)
            </cite>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Sermon Prep?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Join ministry students and pastors at Southeastern University who
              are preparing sermons with AI assistance.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-seu-red hover:bg-gray-100 text-lg px-8"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <SEULogo size="sm" />
          <p className="text-sm text-muted-foreground">
            A project for Southeastern University Ministry Students
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
