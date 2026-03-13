import { Timestamp } from "firebase/firestore";

/**
 * Commentary entry from thebiblesays.com stored in Firestore
 */
export interface TheBibleSaysCommentary {
  id?: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  title: string;
  content: string;
  summary?: string; // Short version for AI context
  sourceUrl: string;
  tags?: string[];
  addedAt: Timestamp | Date;
  addedBy: string;
}

/**
 * Normalized book names for consistent matching
 * Maps common variations to canonical names
 */
const BOOK_ALIASES: Record<string, string> = {
  // Old Testament
  "gen": "Genesis",
  "genesis": "Genesis",
  "ex": "Exodus",
  "exod": "Exodus",
  "exodus": "Exodus",
  "lev": "Leviticus",
  "leviticus": "Leviticus",
  "num": "Numbers",
  "numbers": "Numbers",
  "deut": "Deuteronomy",
  "deuteronomy": "Deuteronomy",
  "josh": "Joshua",
  "joshua": "Joshua",
  "judg": "Judges",
  "judges": "Judges",
  "ruth": "Ruth",
  "1sam": "1 Samuel",
  "1 sam": "1 Samuel",
  "1 samuel": "1 Samuel",
  "2sam": "2 Samuel",
  "2 sam": "2 Samuel",
  "2 samuel": "2 Samuel",
  "1kgs": "1 Kings",
  "1 kgs": "1 Kings",
  "1 kings": "1 Kings",
  "2kgs": "2 Kings",
  "2 kgs": "2 Kings",
  "2 kings": "2 Kings",
  "1chr": "1 Chronicles",
  "1 chr": "1 Chronicles",
  "1 chronicles": "1 Chronicles",
  "2chr": "2 Chronicles",
  "2 chr": "2 Chronicles",
  "2 chronicles": "2 Chronicles",
  "ezra": "Ezra",
  "neh": "Nehemiah",
  "nehemiah": "Nehemiah",
  "esth": "Esther",
  "esther": "Esther",
  "job": "Job",
  "ps": "Psalms",
  "psa": "Psalms",
  "psalm": "Psalms",
  "psalms": "Psalms",
  "prov": "Proverbs",
  "proverbs": "Proverbs",
  "eccl": "Ecclesiastes",
  "ecclesiastes": "Ecclesiastes",
  "song": "Song of Solomon",
  "song of solomon": "Song of Solomon",
  "song of songs": "Song of Solomon",
  "sos": "Song of Solomon",
  "isa": "Isaiah",
  "isaiah": "Isaiah",
  "jer": "Jeremiah",
  "jeremiah": "Jeremiah",
  "lam": "Lamentations",
  "lamentations": "Lamentations",
  "ezek": "Ezekiel",
  "ezekiel": "Ezekiel",
  "dan": "Daniel",
  "daniel": "Daniel",
  "hos": "Hosea",
  "hosea": "Hosea",
  "joel": "Joel",
  "amos": "Amos",
  "obad": "Obadiah",
  "obadiah": "Obadiah",
  "jonah": "Jonah",
  "mic": "Micah",
  "micah": "Micah",
  "nah": "Nahum",
  "nahum": "Nahum",
  "hab": "Habakkuk",
  "habakkuk": "Habakkuk",
  "zeph": "Zephaniah",
  "zephaniah": "Zephaniah",
  "hag": "Haggai",
  "haggai": "Haggai",
  "zech": "Zechariah",
  "zechariah": "Zechariah",
  "mal": "Malachi",
  "malachi": "Malachi",

  // New Testament
  "matt": "Matthew",
  "matthew": "Matthew",
  "mark": "Mark",
  "luke": "Luke",
  "john": "John",
  "jn": "John",
  "acts": "Acts",
  "rom": "Romans",
  "romans": "Romans",
  "1cor": "1 Corinthians",
  "1 cor": "1 Corinthians",
  "1 corinthians": "1 Corinthians",
  "2cor": "2 Corinthians",
  "2 cor": "2 Corinthians",
  "2 corinthians": "2 Corinthians",
  "gal": "Galatians",
  "galatians": "Galatians",
  "eph": "Ephesians",
  "ephesians": "Ephesians",
  "phil": "Philippians",
  "philippians": "Philippians",
  "col": "Colossians",
  "colossians": "Colossians",
  "1thess": "1 Thessalonians",
  "1 thess": "1 Thessalonians",
  "1 thessalonians": "1 Thessalonians",
  "2thess": "2 Thessalonians",
  "2 thess": "2 Thessalonians",
  "2 thessalonians": "2 Thessalonians",
  "1tim": "1 Timothy",
  "1 tim": "1 Timothy",
  "1 timothy": "1 Timothy",
  "2tim": "2 Timothy",
  "2 tim": "2 Timothy",
  "2 timothy": "2 Timothy",
  "titus": "Titus",
  "philem": "Philemon",
  "philemon": "Philemon",
  "heb": "Hebrews",
  "hebrews": "Hebrews",
  "jas": "James",
  "james": "James",
  "1pet": "1 Peter",
  "1 pet": "1 Peter",
  "1 peter": "1 Peter",
  "2pet": "2 Peter",
  "2 pet": "2 Peter",
  "2 peter": "2 Peter",
  "1john": "1 John",
  "1 john": "1 John",
  "1 jn": "1 John",
  "2john": "2 John",
  "2 john": "2 John",
  "2 jn": "2 John",
  "3john": "3 John",
  "3 john": "3 John",
  "3 jn": "3 John",
  "jude": "Jude",
  "rev": "Revelation",
  "revelation": "Revelation",
  "revelations": "Revelation",
};

/**
 * Normalize a book name to its canonical form
 * @param book - The book name to normalize (e.g., "jn", "John", "JOHN")
 * @returns The canonical book name (e.g., "John")
 */
export function normalizeBookName(book: string): string {
  const normalized = book.toLowerCase().trim();
  return BOOK_ALIASES[normalized] || book;
}

/**
 * Parse a scripture reference string into components
 * @param reference - e.g., "John 3:16", "Romans 8:28-30", "1 Cor 13"
 * @returns Parsed components or null if invalid
 */
export function parseScriptureReference(reference: string): {
  book: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
} | null {
  // Handle formats like "John 3:16", "1 Corinthians 13:4-7", "Romans 8"
  const match = reference.match(
    /^(\d?\s*[a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/
  );

  if (!match) return null;

  const [, bookPart, chapterStr, verseStartStr, verseEndStr] = match;
  const book = normalizeBookName(bookPart);
  const chapter = parseInt(chapterStr, 10);
  const verseStart = verseStartStr ? parseInt(verseStartStr, 10) : undefined;
  const verseEnd = verseEndStr ? parseInt(verseEndStr, 10) : undefined;

  return { book, chapter, verseStart, verseEnd };
}
