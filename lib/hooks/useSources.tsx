"use client";

import { useState, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";
import { ExternalSource, SourceFormData, UserSource } from "@/lib/types/source";

/**
 * Hook for managing external sources
 */
export function useSources() {
  const { user, profile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new external source
   */
  const createSource = useCallback(
    async (data: SourceFormData): Promise<string> => {
      if (!user) throw new Error("Not authenticated");

      setLoading(true);
      setError(null);

      try {
        const source: Omit<ExternalSource, "id"> = {
          ...data,
          addedBy: user.uid,
          createdAt: serverTimestamp() as Timestamp,
        };

        const docRef = await addDoc(collection(db, "externalSources"), source);
        return docRef.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create source";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Get a single source by ID
   */
  const getSource = useCallback(async (sourceId: string): Promise<ExternalSource | null> => {
    try {
      const docSnap = await getDoc(doc(db, "externalSources", sourceId));
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() } as ExternalSource;
    } catch {
      return null;
    }
  }, []);

  /**
   * Get all global sources
   */
  const getGlobalSources = useCallback(async (): Promise<ExternalSource[]> => {
    try {
      const q = query(
        collection(db, "externalSources"),
        where("isGlobal", "==", true),
        orderBy("name", "asc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ExternalSource[];
    } catch (err) {
      console.error("Error fetching global sources:", err);
      return [];
    }
  }, []);

  /**
   * Get sources added by the current user
   */
  const getMySources = useCallback(async (): Promise<ExternalSource[]> => {
    if (!user) return [];

    try {
      const q = query(
        collection(db, "externalSources"),
        where("addedBy", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ExternalSource[];
    } catch (err) {
      console.error("Error fetching my sources:", err);
      return [];
    }
  }, [user]);

  /**
   * Delete a source
   */
  const deleteSource = useCallback(
    async (sourceId: string): Promise<void> => {
      if (!user) throw new Error("Not authenticated");

      setLoading(true);
      try {
        await deleteDoc(doc(db, "externalSources", sourceId));
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Add a source to user's connected sources
   */
  const connectSource = useCallback(
    async (source: ExternalSource, apiKey?: string): Promise<void> => {
      if (!user || !profile) throw new Error("Not authenticated");

      const userSource: UserSource = {
        sourceId: source.id!,
        name: source.name,
        type: source.type,
        url: source.url,
        apiKey,
      };

      const existingSources = profile.externalSources || [];

      // Check if already connected
      if (existingSources.some((s) => s.sourceId === source.id)) {
        throw new Error("Source already connected");
      }

      await updateUserProfile({
        externalSources: [...existingSources, userSource],
      });
    },
    [user, profile, updateUserProfile]
  );

  /**
   * Remove a source from user's connected sources
   */
  const disconnectSource = useCallback(
    async (sourceId: string): Promise<void> => {
      if (!user || !profile) throw new Error("Not authenticated");

      const existingSources = profile.externalSources || [];
      await updateUserProfile({
        externalSources: existingSources.filter((s) => s.sourceId !== sourceId),
      });
    },
    [user, profile, updateUserProfile]
  );

  /**
   * Get user's connected sources
   */
  const getConnectedSources = useCallback((): UserSource[] => {
    return profile?.externalSources || [];
  }, [profile]);

  return {
    loading,
    error,
    createSource,
    getSource,
    getGlobalSources,
    getMySources,
    deleteSource,
    connectSource,
    disconnectSource,
    getConnectedSources,
  };
}
