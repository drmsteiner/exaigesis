/**
 * exAIgesis Cloud Functions
 *
 * This file exports all Cloud Functions for the exAIgesis app.
 * Functions are organized by feature area.
 */

// AI Chat functions
// export { aiChat } from "./ai/chat";

// Source fetching functions
// export { fetchSource } from "./sources/fetcher";

// Scoring functions
// export { updateQualityScores } from "./scoring/updateScores";

// Placeholder function to verify deployment works
import { onRequest } from "firebase-functions/v2/https";

export const healthCheck = onRequest((req, res) => {
  res.json({
    status: "ok",
    app: "exAIgesis",
    timestamp: new Date().toISOString(),
  });
});
