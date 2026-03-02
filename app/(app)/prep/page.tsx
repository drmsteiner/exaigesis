"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function PrepPage() {
  const [scripture, setScripture] = useState("");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-seu-red" />
          New Sermon Prep
        </h1>
        <p className="text-muted-foreground">
          Start a new AI-assisted sermon preparation session
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Enter Your Scripture Passage
          </CardTitle>
          <CardDescription>
            Type a Bible reference to begin (e.g., &quot;John 3:16-21&quot; or &quot;Romans 8:28-39&quot;)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="e.g., John 3:16-21"
              value={scripture}
              onChange={(e) => setScripture(e.target.value)}
              className="flex-1 text-lg"
            />
            <Button
              className="bg-seu-red hover:bg-seu-red-hover"
              disabled={!scripture.trim()}
            >
              Start Prep
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg mb-2">AI Chat Interface Coming Soon</p>
        <p className="text-sm">
          This will be the main sermon preparation chat powered by MiniMax M2.5
        </p>
      </div>
    </div>
  );
}
