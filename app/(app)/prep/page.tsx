"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatInterface } from "@/components/ai/ChatInterface";
import { Sparkles, BookOpen, ArrowRight, Edit3 } from "lucide-react";

export default function PrepPage() {
  const [scripture, setScripture] = useState("");
  const [activeScripture, setActiveScripture] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>();

  function handleStartPrep() {
    if (scripture.trim()) {
      setActiveScripture(scripture.trim());
    }
  }

  function handleChangeScripture() {
    setActiveScripture(null);
    setSessionId(undefined);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-seu-red" />
          Sermon Prep
        </h1>
        <p className="text-muted-foreground">
          AI-assisted sermon preparation powered by MiniMax M2.5
        </p>
      </div>

      {/* Scripture Input */}
      {!activeScripture ? (
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStartPrep();
              }}
              className="flex gap-4"
            >
              <Input
                placeholder="e.g., John 3:16-21"
                value={scripture}
                onChange={(e) => setScripture(e.target.value)}
                className="flex-1 text-lg"
              />
              <Button
                type="submit"
                className="bg-seu-red hover:bg-seu-red-hover"
                disabled={!scripture.trim()}
              >
                Start Prep
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Scripture Display */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-seu-red" />
                  <span className="scripture-ref text-lg font-medium">
                    {activeScripture}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleChangeScripture}>
                  <Edit3 className="h-4 w-4 mr-1" />
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Chat */}
          <ChatInterface
            scripture={activeScripture}
            sessionId={sessionId}
            onSessionCreate={setSessionId}
          />
        </>
      )}
    </div>
  );
}
