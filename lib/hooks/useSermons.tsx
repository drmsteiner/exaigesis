"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Sermon,
  SermonFormData,
  SermonVote,
  SermonComment,
  parseScriptureRef,
  calculateQualityScore,
} from "@/lib/types/sermon";

/**
 * Hook for managing sermons
 */
export function useSermons() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new sermon
   */
  const createSermon = useCallback(
    async (data: SermonFormData): Promise<string> => {
      if (!user || !profile) throw new Error("Not authenticated");

      setLoading(true);
      setError(null);

      try {
        const parsed = parseScriptureRef(data.scripture);

        const sermon: Omit<Sermon, "id"> = {
          authorId: user.uid,
          authorName: profile.displayName,
          title: data.title,
          scripture: data.scripture,
          book: parsed?.book || "",
          chapter: parsed?.chapter || 0,
          verseStart: parsed?.verseStart,
          verseEnd: parsed?.verseEnd,
          content: data.content,
          outline: data.outline,
          tags: data.tags,
          visibility: data.visibility,
          upvotes: 0,
          downvotes: 0,
          viewCount: 0,
          qualityScore: 0,
          attachments: [],
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
          aiGenerated: false,
        };

        const docRef = await addDoc(collection(db, "sermons"), sermon);

        // Update user's sermon count
        await updateDoc(doc(db, "users", user.uid), {
          sermonCount: increment(1),
        });

        return docRef.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create sermon";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, profile]
  );

  /**
   * Update an existing sermon
   */
  const updateSermon = useCallback(
    async (sermonId: string, data: Partial<SermonFormData>): Promise<void> => {
      if (!user) throw new Error("Not authenticated");

      setLoading(true);
      setError(null);

      try {
        const updates: Record<string, unknown> = {
          ...data,
          updatedAt: serverTimestamp(),
        };

        // Re-parse scripture if updated
        if (data.scripture) {
          const parsed = parseScriptureRef(data.scripture);
          if (parsed) {
            updates.book = parsed.book;
            updates.chapter = parsed.chapter;
            updates.verseStart = parsed.verseStart;
            updates.verseEnd = parsed.verseEnd;
          }
        }

        await updateDoc(doc(db, "sermons", sermonId), updates);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update sermon";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Delete a sermon
   */
  const deleteSermon = useCallback(
    async (sermonId: string): Promise<void> => {
      if (!user) throw new Error("Not authenticated");

      setLoading(true);
      setError(null);

      try {
        await deleteDoc(doc(db, "sermons", sermonId));

        // Decrement user's sermon count
        await updateDoc(doc(db, "users", user.uid), {
          sermonCount: increment(-1),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete sermon";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Get a single sermon by ID
   */
  const getSermon = useCallback(async (sermonId: string): Promise<Sermon | null> => {
    try {
      const docSnap = await getDoc(doc(db, "sermons", sermonId));
      if (!docSnap.exists()) return null;

      // Increment view count
      await updateDoc(doc(db, "sermons", sermonId), {
        viewCount: increment(1),
      });

      return { id: docSnap.id, ...docSnap.data() } as Sermon;
    } catch (err) {
      console.error("Error fetching sermon:", err);
      return null;
    }
  }, []);

  /**
   * Get sermons by the current user
   */
  const getMySermons = useCallback(async (): Promise<Sermon[]> => {
    if (!user) return [];

    try {
      const q = query(
        collection(db, "sermons"),
        where("authorId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sermon[];
    } catch (err) {
      console.error("Error fetching my sermons:", err);
      return [];
    }
  }, [user]);

  /**
   * Get community sermons (public or community visibility)
   */
  const getCommunitySermons = useCallback(
    async (sortBy: "qualityScore" | "createdAt" = "qualityScore", maxResults = 20): Promise<Sermon[]> => {
      try {
        const q = query(
          collection(db, "sermons"),
          where("visibility", "in", ["public", "community"]),
          orderBy(sortBy, "desc"),
          limit(maxResults)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Sermon[];
      } catch (err) {
        console.error("Error fetching community sermons:", err);
        return [];
      }
    },
    []
  );

  /**
   * Vote on a sermon (upvote or downvote)
   */
  const voteOnSermon = useCallback(
    async (sermonId: string, vote: 1 | -1): Promise<void> => {
      if (!user) throw new Error("Not authenticated");

      try {
        const voteRef = doc(db, "sermons", sermonId, "votes", user.uid);
        const voteSnap = await getDoc(voteRef);

        let upvoteChange = 0;
        let downvoteChange = 0;

        if (voteSnap.exists()) {
          const existingVote = voteSnap.data() as SermonVote;

          if (existingVote.vote === vote) {
            // Remove vote (toggle off)
            await deleteDoc(voteRef);
            if (vote === 1) upvoteChange = -1;
            else downvoteChange = -1;
          } else {
            // Change vote
            await setDoc(voteRef, { oderId: user.uid, vote, createdAt: serverTimestamp() });
            if (vote === 1) {
              upvoteChange = 1;
              downvoteChange = -1;
            } else {
              upvoteChange = -1;
              downvoteChange = 1;
            }
          }
        } else {
          // New vote
          await setDoc(voteRef, { oderId: user.uid, vote, createdAt: serverTimestamp() });
          if (vote === 1) upvoteChange = 1;
          else downvoteChange = 1;
        }

        // Update sermon vote counts
        if (upvoteChange !== 0 || downvoteChange !== 0) {
          const sermonRef = doc(db, "sermons", sermonId);
          await updateDoc(sermonRef, {
            upvotes: increment(upvoteChange),
            downvotes: increment(downvoteChange),
          });

          // Update quality score
          const sermonSnap = await getDoc(sermonRef);
          if (sermonSnap.exists()) {
            const sermon = sermonSnap.data() as Sermon;
            const createdAt = sermon.createdAt instanceof Timestamp
              ? sermon.createdAt.toDate()
              : new Date(sermon.createdAt);
            const newScore = calculateQualityScore(
              sermon.upvotes + upvoteChange,
              sermon.downvotes + downvoteChange,
              sermon.viewCount,
              createdAt
            );
            await updateDoc(sermonRef, { qualityScore: newScore });
          }
        }
      } catch (err) {
        console.error("Error voting:", err);
        throw err;
      }
    },
    [user]
  );

  /**
   * Get user's vote on a sermon
   */
  const getUserVote = useCallback(
    async (sermonId: string): Promise<1 | -1 | null> => {
      if (!user) return null;

      try {
        const voteRef = doc(db, "sermons", sermonId, "votes", user.uid);
        const voteSnap = await getDoc(voteRef);

        if (!voteSnap.exists()) return null;
        return (voteSnap.data() as SermonVote).vote;
      } catch {
        return null;
      }
    },
    [user]
  );

  /**
   * Add a comment to a sermon
   */
  const addComment = useCallback(
    async (sermonId: string, content: string, parentId?: string): Promise<string> => {
      if (!user || !profile) throw new Error("Not authenticated");

      const comment: Omit<SermonComment, "id"> = {
        authorId: user.uid,
        authorName: profile.displayName,
        content,
        createdAt: serverTimestamp() as Timestamp,
        parentId: parentId || null,
      };

      const docRef = await addDoc(
        collection(db, "sermons", sermonId, "comments"),
        comment
      );

      return docRef.id;
    },
    [user, profile]
  );

  /**
   * Get comments for a sermon
   */
  const getComments = useCallback(async (sermonId: string): Promise<SermonComment[]> => {
    try {
      const q = query(
        collection(db, "sermons", sermonId, "comments"),
        orderBy("createdAt", "asc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SermonComment[];
    } catch (err) {
      console.error("Error fetching comments:", err);
      return [];
    }
  }, []);

  return {
    loading,
    error,
    createSermon,
    updateSermon,
    deleteSermon,
    getSermon,
    getMySermons,
    getCommunitySermons,
    voteOnSermon,
    getUserVote,
    addComment,
    getComments,
  };
}

/**
 * Hook for real-time sermon updates
 */
export function useSermonRealtime(sermonId: string) {
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sermonId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "sermons", sermonId),
      (doc) => {
        if (doc.exists()) {
          setSermon({ id: doc.id, ...doc.data() } as Sermon);
        } else {
          setSermon(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to sermon:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sermonId]);

  return { sermon, loading };
}
