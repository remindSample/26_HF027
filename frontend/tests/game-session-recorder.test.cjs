const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");

const recorderPath = path.join(path.dirname(module.filename), "../features/game/sessionRecorder.ts");
const compiled = ts.transpileModule(readFileSync(recorderPath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const recorderModule = new Module(recorderPath, module);
recorderModule.require = (specifier) => specifier === "../../apis/game" ? {} : require(specifier);
recorderModule._compile(compiled, recorderPath);
const { createGameSessionRecorder } = recorderModule.exports;

const event = {
  handSide: "LEFT",
  targetGesture: "SCISSORS",
  userInput: "SCISSORS",
  isCorrect: true,
};

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

function mockApi(overrides = {}) {
  return {
    startGameSession: async () => ({ id: 7 }),
    saveGameEvent: async () => ({}),
    getGameEvents: async () => [],
    finishGameSession: async () => ({}),
    getGameSessionResult: async () => { throw new Error("Session not finished yet"); },
    ...overrides,
  };
}

test("concurrent start calls create a single session", async () => {
  const gate = deferred();
  let starts = 0;
  const recorder = createGameSessionRecorder(3, undefined, mockApi({
    startGameSession: async (level) => {
      starts += 1;
      assert.equal(level, 3);
      await gate.promise;
      return { id: 7 };
    },
  }));
  const first = recorder.start();
  const second = recorder.start();
  assert.equal(recorder.getState().status, "starting");
  gate.resolve();
  await Promise.all([first, second]);
  assert.equal(starts, 1);
  assert.equal(recorder.getState().status, "playing");
});

test("finish waits for every hand event before completing the session", async () => {
  const gate = deferred();
  const calls = [];
  const recorder = createGameSessionRecorder(3, undefined, mockApi({
    saveGameEvent: async (payload) => {
      if (calls.length === 0) await gate.promise;
      calls.push(payload.hand_side);
      assert.equal(payload.target_gesture, "SCISSORS");
    },
    finishGameSession: async (...args) => {
      calls.push("finish");
      assert.deepEqual(args, [7, 1, 1]);
    },
  }));
  await recorder.start();
  recorder.record(event);
  recorder.record({ ...event, handSide: "RIGHT" });
  const finishing = recorder.finish(1, 1);
  await Promise.resolve();
  assert.deepEqual(calls, []);
  gate.resolve();
  await finishing;
  assert.deepEqual(calls, ["LEFT", "RIGHT", "finish"]);
  assert.equal(recorder.getState().status, "finished");
  await recorder.finish(1, 1);
  assert.equal(calls.length, 3);
});

test("retry reconciles a committed event whose POST response was lost", async () => {
  const stored = [];
  let posts = 0;
  const recorder = createGameSessionRecorder(3, undefined, mockApi({
    saveGameEvent: async (payload) => {
      posts += 1;
      stored.push(payload);
      if (posts === 1) throw new Error("response lost");
    },
    getGameEvents: async () => [...stored],
  }));
  await recorder.start();
  recorder.record(event);
  recorder.record({ ...event, handSide: "RIGHT" });
  await assert.rejects(recorder.finish(1, 1), /response lost/);
  assert.equal(posts, 1);
  assert.equal(recorder.getState().failedEventCount, 2);
  await recorder.retryFailedEvents();
  await recorder.finish(1, 1);
  assert.equal(posts, 2);
  assert.deepEqual(stored.map((saved) => saved.hand_side), ["LEFT", "RIGHT"]);
});

test("an uncommitted event failure keeps the queue for an explicit retry", async () => {
  let posts = 0;
  let finishes = 0;
  const recorder = createGameSessionRecorder(3, undefined, mockApi({
    saveGameEvent: async () => {
      posts += 1;
      if (posts === 1) throw new Error("offline");
    },
    finishGameSession: async () => { finishes += 1; },
  }));
  await recorder.start();
  recorder.record(event);
  await assert.rejects(recorder.finish(0, 1), /offline/);
  assert.equal(posts, 1);
  assert.equal(finishes, 0);
  await recorder.retryFailedEvents();
  await recorder.finish(0, 1);
  assert.equal(posts, 2);
  assert.equal(finishes, 1);
});

test("a lost finish response is recovered by reading the saved result", async () => {
  let finishes = 0;
  let reads = 0;
  const recorder = createGameSessionRecorder(3, undefined, mockApi({
    finishGameSession: async () => {
      finishes += 1;
      throw new Error("response lost");
    },
    getGameSessionResult: async (id) => {
      reads += 1;
      assert.equal(id, 7);
      return { id };
    },
  }));
  await recorder.start();
  await recorder.finish(0, 0);
  await recorder.finish(0, 0);
  assert.equal(finishes, 1);
  assert.equal(reads, 1);
  assert.equal(recorder.getState().status, "finished");
});

test("unexpected remote events block retry instead of duplicating records", async () => {
  let posts = 0;
  const recorder = createGameSessionRecorder(3, undefined, mockApi({
    saveGameEvent: async () => {
      posts += 1;
      throw new Error("offline");
    },
    getGameEvents: async () => [{ hand_side: "RIGHT" }],
  }));
  await recorder.start();
  recorder.record(event);
  await assert.rejects(recorder.finish(0, 1));
  await assert.rejects(recorder.retryFailedEvents(), /일치하지/);
  assert.equal(posts, 1);
});
