import { getIO } from "../config/socket.js";
import { InterviewSession } from "../models/InterviewSession.js";
import { aiService } from "../services/ai.service.js";

// Track active timers so we can clear them on disconnect / session end
const sessionTimers = new Map();

export function registerInterviewSocket(namespace) {
  namespace.on("connection", (socket) => {
    socket.on("join-session", ({ sessionId }) => {
      socket.join(`interview:${sessionId}`);
    });

    // Client signals AI is computing — relay to room (e.g., second listener)
    socket.on("ai-thinking", ({ sessionId }) => {
      namespace.to(`interview:${sessionId}`).emit("ai-thinking", { sessionId });
    });

    // Start a server-side countdown for a timed session
    socket.on("start-timer", ({ sessionId, durationMinutes }) => {
      if (sessionTimers.has(sessionId)) return; // already running

      const endAt = Date.now() + durationMinutes * 60 * 1000;

      const interval = setInterval(() => {
        const remaining = Math.max(0, endAt - Date.now());
        namespace.to(`interview:${sessionId}`).emit("timer-tick", {
          sessionId,
          remaining,
          endAt
        });

        if (remaining <= 0) {
          clearInterval(interval);
          sessionTimers.delete(sessionId);
          namespace.to(`interview:${sessionId}`).emit("session-ended", { sessionId });
        }
      }, 1000);

      sessionTimers.set(sessionId, interval);

      // Immediately emit first tick
      namespace.to(`interview:${sessionId}`).emit("timer-tick", {
        sessionId,
        remaining: durationMinutes * 60 * 1000,
        endAt
      });
    });

    // Stop timer (e.g., when student manually ends the session)
    socket.on("stop-timer", ({ sessionId }) => {
      const timer = sessionTimers.get(sessionId);
      if (timer) {
        clearInterval(timer);
        sessionTimers.delete(sessionId);
      }
    });

    // Streaming AI evaluation — client sends answer, AI tokens stream back
    socket.on("stream-evaluate", async ({ sessionId, questionIndex, answer }) => {
      const session = await InterviewSession.findById(sessionId).catch(() => null);
      if (!session) {
        socket.emit("stream-error", { sessionId, error: "Session not found" });
        return;
      }

      const question = session.questions[questionIndex];
      if (!question) {
        socket.emit("stream-error", { sessionId, error: "Question not found" });
        return;
      }

      namespace.to(`interview:${sessionId}`).emit("ai-thinking", { sessionId });

      try {
        let buffer = "";
        await aiService.streamText({
          instructions:
            "You are a strict but fair interviewer. Evaluate this answer. Return JSON with score, verdict, feedback, strengths, improvements, idealAnswer.",
          input: `Question: ${question.question}\nExpected key points: ${JSON.stringify(question.expectedPoints)}\nCandidate answer: ${answer}`,
          onToken: (token) => {
            buffer += token;
            namespace
              .to(`interview:${sessionId}`)
              .emit("ai-response-stream", { sessionId, token });
          }
        });

        let parsed;
        try {
          parsed = JSON.parse(buffer);
        } catch {
          parsed = { score: 0, verdict: "weak", feedback: buffer, strengths: [], improvements: [] };
        }

        // Store the response on the session
        session.responses.push({
          question: question.question,
          userAnswer: answer,
          ...parsed
        });
        await session.save();

        namespace
          .to(`interview:${sessionId}`)
          .emit("ai-response-complete", { sessionId, evaluation: parsed });
      } catch (error) {
        socket.emit("stream-error", {
          sessionId,
          error: error.message ?? "AI evaluation failed"
        });
      }
    });

    socket.on("disconnect", () => {
      // Clean up any timers for sessions this socket was driving
      // (timers are per-session, not per-socket, so we only clear if explicitly told)
    });
  });
}

// Exported so interview.controller.js can stop a timer when session ends via HTTP
export function clearSessionTimer(sessionId) {
  const timer = sessionTimers.get(sessionId);
  if (timer) {
    clearInterval(timer);
    sessionTimers.delete(sessionId);
  }
}

// Utility called from interview.controller.js to notify via socket after HTTP respond
export function emitEvaluation(sessionId, evaluation) {
  getIO()
    ?.of("/interview")
    ?.to(`interview:${sessionId}`)
    ?.emit("ai-response-complete", { sessionId, evaluation });
}
