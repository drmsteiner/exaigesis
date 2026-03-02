import { Timestamp } from "firebase/firestore";

/**
 * Sermon document structure in Firestore
 */
export interface Sermon {
  id?: string;
  authorId: string;
  authorName: string;
  title: string;
  scripture: string;
  book: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  content: string;
  outline?: string;
  tags: string[];
  visibility: "public" | "private" | "community";
  upvotes: number;
  downvotes: number;
  viewCount: number;
  qualityScore: number;
  attachments: SermonAttachment[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  aiGenerated: boolean;
}

export interface SermonAttachment {
  name: string;
  storageUrl: string;
  type: string;
}

/**
 * Vote on a sermon (subcollection)
 */
export interface SermonVote {
  oderId: string;
  vote: 1 | -1;
  createdAt: Timestamp | Date;
}

/**
 * Comment on a sermon (subcollection)
 */
export interface SermonComment {
  id?: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Timestamp | Date;
  parentId?: string | null;
}

/**
 * Form data for creating/editing a sermon
 */
export interface SermonFormData {
  title: string;
  scripture: string;
  content: string;
  outline?: string;
  tags: string[];
  visibility: "public" | "private" | "community";
}

/**
 * Parse a scripture reference into components
 * Examples: "John 3:16", "Romans 8:28-39", "1 Cor 13:1-13"
 */
export function parseScriptureRef(ref: string): {
  book: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
} | null {
  // Remove extra whitespace
  const cleaned = ref.trim();

  // Pattern: Book Chapter:VerseStart-VerseEnd
  // Handles: "John 3:16", "1 John 3:16-18", "Romans 8", "1 Cor 13:1-13"
  const pattern = /^(\d?\s?[A-Za-z]+(?:\s[A-Za-z]+)?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/;
  const match = cleaned.match(pattern);

  if (!match) {
    return null;
  }

  const [, book, chapter, verseStart, verseEnd] = match;

  return {
    book: book.trim(),
    chapter: parseInt(chapter, 10),
    verseStart: verseStart ? parseInt(verseStart, 10) : undefined,
    verseEnd: verseEnd ? parseInt(verseEnd, 10) : undefined,
  };
}

/**
 * Format a scripture reference from components
 */
export function formatScriptureRef(
  book: string,
  chapter: number,
  verseStart?: number,
  verseEnd?: number
): string {
  let ref = `${book} ${chapter}`;
  if (verseStart) {
    ref += `:${verseStart}`;
    if (verseEnd && verseEnd !== verseStart) {
      ref += `-${verseEnd}`;
    }
  }
  return ref;
}

/**
 * Calculate quality score for a sermon
 * Uses time-weighted voting with engagement bonus
 */
export function calculateQualityScore(
  upvotes: number,
  downvotes: number,
  viewCount: number,
  createdAt: Date
): number {
  const now = new Date();
  const daysSinceCreation = Math.max(
    0,
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Exponential decay over ~60 days
  const recencyWeight = Math.exp(-0.05 * daysSinceCreation);

  // Net votes weighted by recency
  const netVotes = upvotes - downvotes;

  // Small engagement bonus based on views
  const engagementBonus = Math.log(viewCount + 1) * 0.1;

  return netVotes * recencyWeight + engagementBonus;
}
