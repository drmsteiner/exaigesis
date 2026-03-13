"use client";

import { useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  TheBibleSaysCommentary,
  normalizeBookName,
  parseScriptureReference,
} from "@/lib/types/commentary";

/**
 * Hook for fetching and formatting commentary from thebiblesays.com
 */
export function useCommentary() {
  /**
   * Fetch commentary entries that match a scripture reference
   * @param reference - Scripture reference (e.g., "John 3:16", "Romans 8:28-30")
   * @returns Array of matching commentary entries
   */
  const getCommentaryForScripture = useCallback(
    async (reference: string): Promise<TheBibleSaysCommentary[]> => {
      const parsed = parseScriptureReference(reference);
      if (!parsed) {
        console.warn("Could not parse scripture reference:", reference);
        return [];
      }

      const { book, chapter, verseStart, verseEnd } = parsed;
      const normalizedBook = normalizeBookName(book);

      try {
        // Query for commentaries that match the book and chapter
        const commentaryRef = collection(db, "thebiblesays");
        const q = query(
          commentaryRef,
          where("book", "==", normalizedBook),
          where("chapter", "==", chapter),
          orderBy("verseStart", "asc"),
          limit(10)
        );

        const snapshot = await getDocs(q);
        const commentaries: TheBibleSaysCommentary[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data() as TheBibleSaysCommentary;
          const commentary = { ...data, id: doc.id };

          // If we have specific verses, check for overlap
          if (verseStart !== undefined) {
            const commentaryEnd = commentary.verseEnd || commentary.verseStart;
            const queryEnd = verseEnd || verseStart;

            // Check if verse ranges overlap
            const hasOverlap =
              commentary.verseStart <= queryEnd && commentaryEnd >= verseStart;

            if (hasOverlap) {
              commentaries.push(commentary);
            }
          } else {
            // No specific verse - include all commentaries for this chapter
            commentaries.push(commentary);
          }
        });

        return commentaries;
      } catch (error) {
        console.error("Error fetching commentary:", error);
        return [];
      }
    },
    []
  );

  /**
   * Format commentary entries for inclusion in the AI system prompt
   * @param commentaries - Array of commentary entries
   * @returns Formatted string for AI context
   */
  const formatCommentaryForAI = useCallback(
    (commentaries: TheBibleSaysCommentary[]): string => {
      if (commentaries.length === 0) return "";

      const sections = commentaries.map((c) => {
        const verseRange = c.verseEnd
          ? `${c.verseStart}-${c.verseEnd}`
          : `${c.verseStart}`;
        const reference = `${c.book} ${c.chapter}:${verseRange}`;

        // Use summary if available, otherwise use full content
        const text = c.summary || c.content;

        return `### ${c.title} (${reference})
${text}
Source: ${c.sourceUrl}`;
      });

      return `
## Commentary from thebiblesays.com

The following biblical commentary is provided as a reference. When using this content, always attribute it to thebiblesays.com.

${sections.join("\n\n")}

---
`;
    },
    []
  );

  return {
    getCommentaryForScripture,
    formatCommentaryForAI,
  };
}
