import { NextRequest, NextResponse } from "next/server";

/**
 * API route for AI chat using MiniMax API directly
 *
 * This route calls the MiniMax API (OpenAI-compatible endpoint).
 * Requires MINIMAX_API_KEY environment variable to be set.
 */

const MINIMAX_API_URL = "https://api.minimax.io/v1/chat/completions";
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const DEFAULT_MODEL = process.env.MINIMAX_MODEL || "MiniMax-M2.5-Lightning";

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
    // Check if API key is configured
    if (!MINIMAX_API_KEY) {
      return NextResponse.json(
        {
          error: "MiniMax API key not configured",
          details: "Add MINIMAX_API_KEY to your .env.local file",
        },
        { status: 500 }
      );
    }

    const body: ChatRequest = await request.json();
    const { messages, model = DEFAULT_MODEL, stream = false } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Call MiniMax API (OpenAI-compatible endpoint)
    const minimaxResponse = await fetch(MINIMAX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream,
      }),
    });

    if (!minimaxResponse.ok) {
      const errorText = await minimaxResponse.text();
      console.error("MiniMax API error:", errorText);

      // Handle common error cases
      if (minimaxResponse.status === 401) {
        return NextResponse.json(
          {
            error: "Invalid API key",
            details: "Check that your MINIMAX_API_KEY is correct",
          },
          { status: 401 }
        );
      }

      if (minimaxResponse.status === 429) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            details: "Too many requests. Please wait and try again.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "AI request failed", details: errorText },
        { status: minimaxResponse.status }
      );
    }

    // Parse the OpenAI-compatible response
    const data = await minimaxResponse.json();

    // Extract the assistant's response from OpenAI format
    const assistantMessage = data.choices?.[0]?.message;

    // Strip <think>...</think> reasoning blocks from response
    // MiniMax models include chain-of-thought reasoning that shouldn't be shown to users
    let content = assistantMessage?.content || "";
    content = content.replace(/<think>[\s\S]*?<\/think>\s*/g, "").trim();

    return NextResponse.json({
      message: { ...assistantMessage, content },
      response: content,
      model: data.model,
      created_at: new Date().toISOString(),
      done: true,
      usage: data.usage,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error: "Cannot connect to MiniMax API",
          details: "Check your internet connection",
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
