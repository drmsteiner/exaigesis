"use client";

import { useState, useCallback, useRef } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCommentary } from "@/lib/hooks/useCommentary";

/**
 * Chat message structure
 */
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

/**
 * AI session stored in Firestore
 */
export interface AISession {
  id?: string;
  userId: string;
  sermonId?: string;
  scripture?: string;
  messages: ChatMessage[];
  sourcesUsed: string[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

/**
 * System prompt for the sermon prep assistant
 */
function buildSystemPrompt(
  scripture?: string,
  sources?: string[],
  commentaryContent?: string
): string {
  let prompt = `You are exAIgesis, an AI sermon preparation assistant for Southeastern University. You help pastors, ministry students, and church leaders prepare biblically faithful, theologically sound, and practically applicable sermons.

Your role is to:
- Help users understand and interpret biblical texts
- Suggest sermon outlines and structures
- Provide relevant illustrations and applications
- Reference original language insights (Greek/Hebrew) when helpful
- Be conversational, pastoral, and encouraging in tone

Guidelines:
- Always ground insights in the biblical text
- Cite scripture references accurately
- Suggest practical applications for modern audiences
- If asked about controversial topics, present multiple evangelical perspectives fairly
- Do not make up historical facts or quotes - acknowledge when you're unsure
`;

  if (scripture) {
    prompt += `\nThe user is preparing a sermon on: ${scripture}\n`;
  }

  if (sources && sources.length > 0) {
    prompt += `\nThe user has these external sources connected: ${sources.join(", ")}\n`;
  }

  if (commentaryContent) {
    prompt += `\n${commentaryContent}`;
    prompt += `\nWhen referencing information from thebiblesays.com, always attribute it appropriately (e.g., "According to thebiblesays.com...").\n`;
  }

  return prompt;
}

/**
 * Hook for AI chat functionality using Ollama with MiniMax M2.5
 */
export function useAIChat(sessionId?: string) {
  const { user, profile } = useAuth();
  const { getCommentaryForScripture, formatCommentaryForAI } = useCommentary();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Load an existing session
   */
  const loadSession = useCallback(async (id: string): Promise<void> => {
    if (!user) return;

    try {
      const sessionDoc = await getDoc(doc(db, "aiSessions", id));
      if (sessionDoc.exists()) {
        const session = sessionDoc.data() as AISession;
        setMessages(session.messages);
        setCurrentSessionId(id);
      }
    } catch (err) {
      console.error("Error loading session:", err);
    }
  }, [user]);

  /**
   * Create a new session
   */
  const createSession = useCallback(
    async (scripture?: string): Promise<string> => {
      if (!user) throw new Error("Not authenticated");

      const session: Omit<AISession, "id"> = {
        userId: user.uid,
        scripture,
        messages: [],
        sourcesUsed: [],
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(collection(db, "aiSessions"), session);
      setCurrentSessionId(docRef.id);
      setMessages([]);
      return docRef.id;
    },
    [user]
  );

  /**
   * Send a message to the AI
   */
  const sendMessage = useCallback(
    async (content: string, scripture?: string): Promise<void> => {
      if (!user || !profile) throw new Error("Not authenticated");

      setIsLoading(true);
      setError(null);

      // Add user message to state immediately
      const userMessage: ChatMessage = {
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Create session if needed
        let sessionIdToUse = currentSessionId;
        if (!sessionIdToUse) {
          sessionIdToUse = await createSession(scripture);
        }

        // Fetch commentary if theBibleSays is enabled and scripture is provided
        let commentaryContent = "";
        const theBibleSaysEnabled = profile.builtInSources?.theBibleSays ?? true;
        if (scripture && theBibleSaysEnabled) {
          const commentaries = await getCommentaryForScripture(scripture);
          if (commentaries.length > 0) {
            commentaryContent = formatCommentaryForAI(commentaries);
          }
        }

        // Build messages array for Ollama
        const systemPrompt = buildSystemPrompt(
          scripture,
          profile.externalSources?.map((s) => s.name),
          commentaryContent
        );

        const ollamaMessages = [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content },
        ];

        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        // Call Ollama API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: ollamaMessages,
            model: "minimax-m2.5:cloud",
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        const assistantContent = data.message?.content || data.response || "";

        // Add assistant message
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: assistantContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Save to Firestore
        if (sessionIdToUse) {
          await updateDoc(doc(db, "aiSessions", sessionIdToUse), {
            messages: arrayUnion(
              { ...userMessage, timestamp: new Date().toISOString() },
              { ...assistantMessage, timestamp: new Date().toISOString() }
            ),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          // Request was cancelled
          return;
        }
        const message = err instanceof Error ? err.message : "Failed to send message";
        setError(message);
        // Remove the user message if there was an error
        setMessages((prev) => prev.slice(0, -1));
        throw err;
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [user, profile, messages, currentSessionId, createSession, getCommentaryForScripture, formatCommentaryForAI]
  );

  /**
   * Cancel the current request
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear the current chat
   */
  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(undefined);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId: currentSessionId,
    sendMessage,
    loadSession,
    createSession,
    cancelRequest,
    clearChat,
  };
}
