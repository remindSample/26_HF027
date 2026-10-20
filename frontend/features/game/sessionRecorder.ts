import {
  finishGameSession,
  getGameEvents,
  getGameSessionResult,
  saveGameEvent,
  startGameSession,
} from "../../apis/game";
import type { GameEventPayload, GameGesture, GameHand } from "../../apis/game";

export type RecordedGameEvent = {
  handSide: GameHand;
  targetGesture: GameGesture;
  userInput: GameGesture | null;
  isCorrect: boolean;
};

export type GameRecorderState = {
  status: "idle" | "starting" | "playing" | "saving" | "finished" | "error";
  error: string | null;
  failedEventCount: number;
  failureStage: "start" | "events" | "finish" | null;
};

type RecorderApi = {
  startGameSession: typeof startGameSession;
  saveGameEvent: typeof saveGameEvent;
  getGameEvents: typeof getGameEvents;
  finishGameSession: typeof finishGameSession;
  getGameSessionResult: typeof getGameSessionResult;
};

const defaultApi: RecorderApi = {
  startGameSession,
  saveGameEvent,
  getGameEvents,
  finishGameSession,
  getGameSessionResult,
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

type StoredGameEvent = Omit<GameEventPayload, "session_id">;

function sameEvent(left: StoredGameEvent, right: StoredGameEvent) {
  return left.hand_side === right.hand_side &&
    left.target_gesture === right.target_gesture &&
    left.user_input === right.user_input &&
    left.is_correct === right.is_correct;
}

// The queue owns its requests so navigation does not cancel pending event saves.
export function createGameSessionRecorder(
  level: number,
  onStateChange?: (state: GameRecorderState) => void,
  api: RecorderApi = defaultApi,
) {
  let state: GameRecorderState = {
    status: "idle",
    error: null,
    failedEventCount: 0,
    failureStage: null,
  };
  let sessionId: number | null = null;
  let startPromise: Promise<void> | null = null;
  let drainPromise: Promise<void> | null = null;
  let finishPromise: Promise<void> | null = null;
  let closing = false;
  let savedCount = 0;
  const events: StoredGameEvent[] = [];
  const listeners = new Set<(state: GameRecorderState) => void>();

  function updateState(next: Partial<GameRecorderState>) {
    state = { ...state, ...next };
    onStateChange?.({ ...state });
    listeners.forEach((listener) => listener({ ...state }));
  }

  function drain(): Promise<void> {
    if (drainPromise) return drainPromise;
    const id = sessionId;
    if (id === null) return Promise.reject(new Error("게임 기록을 먼저 시작해주세요."));

    drainPromise = (async () => {
      while (savedCount < events.length) {
        try {
          await api.saveGameEvent({ session_id: id, ...events[savedCount] });
          savedCount += 1;
        } catch (error) {
          updateState({
            status: "error",
            error: errorMessage(error, "손동작 기록을 저장하지 못했습니다."),
            failureStage: "events",
            failedEventCount: events.length - savedCount,
          });
          throw error;
        }
      }
    })().finally(() => {
      drainPromise = null;
    });
    return drainPromise;
  }

  async function start() {
    if (sessionId !== null) return;
    if (startPromise) return startPromise;
    updateState({ status: "starting", error: null, failureStage: null });
    startPromise = (async () => {
      try {
        const session = await api.startGameSession(level);
        sessionId = session.id;
        updateState({ status: "playing" });
      } catch (error) {
        updateState({
          status: "error",
          error: errorMessage(error, "게임 기록을 시작하지 못했습니다."),
          failureStage: "start",
        });
        throw error;
      }
    })().finally(() => {
      startPromise = null;
    });
    return startPromise;
  }

  function record(event: RecordedGameEvent) {
    if (sessionId === null || closing) {
      throw new Error("진행 중인 게임에만 손동작을 기록할 수 있습니다.");
    }
    events.push({
      hand_side: event.handSide,
      target_gesture: event.targetGesture,
      user_input: event.userInput,
      is_correct: event.isCorrect,
    });
    if (state.failureStage === "events") {
      updateState({ failedEventCount: events.length - savedCount });
      return;
    }
    // Errors remain visible in state and are retried only through retryFailedEvents.
    void drain().catch(() => {});
  }

  async function retryFailedEvents() {
    const id = sessionId;
    if (id === null) throw new Error("게임 기록을 먼저 시작해주세요.");
    if (state.status === "finished") return;
    if (drainPromise) await drainPromise.catch(() => {});

    updateState({ status: "saving", error: null });
    try {
      // A failed response may still have committed. Reconcile before any new POST.
      const storedEvents = await api.getGameEvents(id);
      if (storedEvents.length > events.length ||
          storedEvents.some((event, index) => !sameEvent(event, events[index]))) {
        throw new Error("서버의 게임 기록이 일치하지 않습니다. 다시 확인해주세요.");
      }
      savedCount = storedEvents.length;
      updateState({ failureStage: null, failedEventCount: 0 });
      await drain();
      updateState({ status: closing ? "saving" : "playing" });
    } catch (error) {
      updateState({
        status: "error",
        error: errorMessage(error, "손동작 기록을 저장하지 못했습니다."),
        failureStage: "events",
        failedEventCount: events.length - savedCount,
      });
      throw error;
    }
  }

  async function finish(successCount: number, totalCount: number) {
    if (state.status === "finished") return;
    if (finishPromise) return finishPromise;
    closing = true;
    finishPromise = (async () => {
      try {
        if (startPromise) await startPromise;
        const id = sessionId;
        if (id === null) throw new Error("게임 기록을 먼저 시작해주세요.");
        if (state.failureStage === "events") {
          throw new Error(state.error ?? "손동작 기록을 다시 저장해주세요.");
        }
        updateState({ status: "saving", error: null, failureStage: null });
        do {
          await drain();
        } while (savedCount < events.length);
        try {
          await api.finishGameSession(id, successCount, totalCount);
        } catch (error) {
          // A completed session is safe to read even if its finish response was lost.
          try {
            await api.getGameSessionResult(id);
          } catch {
            throw error;
          }
        }
        updateState({ status: "finished", failedEventCount: 0 });
      } catch (error) {
        if (state.failureStage !== "events") {
          updateState({
            status: "error",
            error: errorMessage(error, "게임 결과를 저장하지 못했습니다."),
            failureStage: "finish",
          });
        }
        throw error;
      }
    })().finally(() => {
      finishPromise = null;
    });
    return finishPromise;
  }

  return {
    subscribe: (listener: (state: GameRecorderState) => void) => {
      listeners.add(listener);
      listener({ ...state });
      return () => { listeners.delete(listener); };
    },
    start,
    record,
    finish,
    retryFailedEvents,
    getState: () => ({ ...state }),
  };
}
