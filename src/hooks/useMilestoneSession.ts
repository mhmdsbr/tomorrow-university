"use client";

import { useEffect, useState } from "react";
import {
  MILESTONE_SESSION_KEY,
  restoreMilestoneSession,
  type MilestoneSession,
} from "../utils/milestone-session";

export function useMilestoneSession() {
  const [session, setSession] = useState<MilestoneSession>({
    version: 3,
    topicInput: { title: "", description: "" },
    draft: null,
    draftTopic: null,
    selectedPathwayId: null,
    saved: false,
    editing: [],
    legacy: false,
  });
  const [sessionReady, setSessionReady] = useState(false);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(MILESTONE_SESSION_KEY);
      if (stored !== null) {
        const { state } = restoreMilestoneSession(JSON.parse(stored));
        setSession(state);
      }
    } catch (error) {
      console.error("Could not restore pathway session:", error);
      setStorageError(
        "Could not restore your previous browser session. Keep any visible draft open.",
      );
    } finally {
      setSessionReady(true);
    }
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    try {
      sessionStorage.setItem(MILESTONE_SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error("Could not preserve pathway session:", error);
      setStorageError(
        "Browser session storage is unavailable or full. Keep this page open: changes may be lost on reload.",
      );
    }
  }, [sessionReady, session]);

  return { session, setSession, sessionReady, storageError };
}
