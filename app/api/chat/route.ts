import { NextRequest, NextResponse } from "next/server";

/**
 * API route for AI chat using Ollama with MiniMax M2.5
 *
 * This route proxies chat requests to the local Ollama server.
 * In production, you might want to add authentication and rate limiting.
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "minimax-m2.5:cloud";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  stream?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, model = DEFAULT_MODEL, stream = false } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Call Ollama API
    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream,
      }),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      console.error("Ollama error:", errorText);

      // Check if Ollama is not running
      if (ollamaResponse.status === 404 || ollamaResponse.status === 502) {
        return NextResponse.json(
          {
            error: "AI service unavailable",
            details: "Ollama is not running. Start it with: ollama serve",
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: "AI request failed", details: errorText },
        { status: ollamaResponse.status }
      );
    }

    // For non-streaming response
    const data = await ollamaResponse.json();

    return NextResponse.json({
      message: data.message,
      response: data.message?.content,
      model: data.model,
      created_at: data.created_at,
      done: data.done,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Check if it's a connection error (Ollama not running)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error: "Cannot connect to AI service",
          details: "Make sure Ollama is running: ollama serve",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
