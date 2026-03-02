import { Timestamp } from "firebase/firestore";

/**
 * External source document structure in Firestore
 */
export interface ExternalSource {
  id?: string;
  name: string;
  type: SourceType;
  url: string;
  description: string;
  isGlobal: boolean;
  addedBy: string;
  apiKeyRequired: boolean;
  createdAt: Timestamp | Date;
}

export type SourceType =
  | "commentary"
  | "lexicon"
  | "devotional"
  | "theology"
  | "custom_api"
  | "rss";

/**
 * User's connected source with optional API key
 */
export interface UserSource {
  sourceId: string;
  name: string;
  type: SourceType;
  url: string;
  apiKey?: string;
}

/**
 * Source form data for creating/editing
 */
export interface SourceFormData {
  name: string;
  type: SourceType;
  url: string;
  description: string;
  isGlobal: boolean;
  apiKeyRequired: boolean;
}

/**
 * Get display name for source type
 */
export function getSourceTypeName(type: SourceType): string {
  const names: Record<SourceType, string> = {
    commentary: "Bible Commentary",
    lexicon: "Greek/Hebrew Lexicon",
    devotional: "Devotional",
    theology: "Theological Resource",
    custom_api: "Custom API",
    rss: "RSS Feed",
  };
  return names[type];
}

/**
 * Get icon name for source type (lucide icon name)
 */
export function getSourceTypeIcon(type: SourceType): string {
  const icons: Record<SourceType, string> = {
    commentary: "BookText",
    lexicon: "Languages",
    devotional: "Heart",
    theology: "FileText",
    custom_api: "Globe",
    rss: "Rss",
  };
  return icons[type];
}
