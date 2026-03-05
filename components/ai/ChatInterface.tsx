"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useAIChat } from "@/lib/hooks/useAIChat";
import { MessageBubble } from "./MessageBubble";
import { Send, Loader2, StopCircle, Sparkles, RefreshCw } from "lucide-react";

interface ChatInterfaceProps {
  scripture?: string;
  sessionId?: string;
  onSessionCreate?: (sessionId: string) => void;
}

export function ChatInterface({
  scripture,
  sessionId,
  onSessionCreate,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isLoading,
    error,
    sessionId: currentSessionId,
    sendMessage,
    loadSession,
    cancelRequest,
    clearChat,
  } = useAIChat(sessionId);

  // Load existing session
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Notify parent of session creation
  useEffect(() => {
    if (currentSessionId && onSessionCreate) {
      onSessionCreate(currentSessionId);
    }
  }, [currentSessionId, onSessionCreate]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    setInput("");
    try {
      await sendMessage(trimmedInput, scripture);
    } catch {
      // Error is handled by the hook
    }

    // Focus back on input
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-seu-red" />
          <span className="font-semibold">AI Assistant</span>
          {scripture && (
            <span className="text-sm text-muted-foreground">
              | Studying {scripture}
            </span>
          )}
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <RefreshCw className="h-4 w-4 mr-1" />
            New Chat
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Sparkles className="h-12 w-12 mb-4 text-seu-red/50" />
            <h3 className="font-semibold text-lg mb-2">Start Your Sermon Prep</h3>
            <p className="max-w-md">
              Ask questions about your scripture passage, request outline
              suggestions, or explore theological themes.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {[
                "Help me outline this passage",
                "What's the historical context?",
                "Suggest sermon illustrations",
                "Key Greek/Hebrew words?",
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your passage..."
            disabled={isLoading}
            className="resize-none min-h-[60px]"
            rows={2}
          />
          {isLoading ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={cancelRequest}
              className="shrink-0"
            >
              <StopCircle className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!input.trim()}
              className="shrink-0 bg-seu-red hover:bg-seu-red-hover"
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </Card>
  );
}
