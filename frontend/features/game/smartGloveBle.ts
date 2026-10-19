import { NativeModules, PermissionsAndroid, Platform } from "react-native";
import { BleError, BleManager, Device, State } from "react-native-ble-plx";
import { GloveInput, Side, parseGestureMessage, parseGloveMessage } from "./gloveInput";

export type SmartGloveConnectionState =
  | "disconnected"
  | "scanning"
  | "connecting"
  | "connected";

type ConnectedSmartGlove = {
  id: string;
  name: string;
  side: Side;
};

type ConnectOptions = {
  onStateChange?: (state: SmartGloveConnectionState) => void;
  signal?: AbortSignal;
};

type SubscribeOptions = {
  onInput: (input: GloveInput) => void;
  onMessage?: (message: string) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
};

const LEFT_GLOVE_NAME = "ReMind Left Glove";
const RIGHT_GLOVE_NAME = "ReMind Right Glove";
const SMART_GLOVE_DEVICE_SIDES: Record<string, Side> = {
  [LEFT_GLOVE_NAME]: "LEFT",
  [RIGHT_GLOVE_NAME]: "RIGHT"
};
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const SCAN_TIMEOUT_MS = 12000;
const SMART_GLOVE_SIDES: Side[] = ["LEFT", "RIGHT"];

let manager: BleManager | null = null;
let connectedDevices: Partial<Record<Side, Device>> = {};
let inputCleanup: (() => void) | null = null;
let connectionAttempt: Promise<ConnectedSmartGlove> | null = null;
let connectionController: AbortController | null = null;
const connectionListeners = new Set<(sides: Side[]) => void>();
const disconnectSubscriptions: Partial<Record<Side, { remove: () => void }>> = {};

function notifyConnectionListeners() {
  for (const side of SMART_GLOVE_SIDES) {
    if (!connectedDevices[side]) {
      disconnectSubscriptions[side]?.remove();
      delete disconnectSubscriptions[side];
    }
  }
  const sides = getConnectedSmartGloveSides();
  connectionListeners.forEach((listener) => listener(sides));
}

export function subscribeSmartGloveConnection(listener: (sides: Side[]) => void) {
  connectionListeners.add(listener);
  listener(getConnectedSmartGloveSides());
  return () => { connectionListeners.delete(listener); };
}

function getManager() {
  if (Platform.OS === "web") {
    throw new Error("스마트 장갑 연결은 Android 또는 iOS 앱에서 지원됩니다.");
  }
  if (!NativeModules.BlePlx) {
    throw new Error("스마트 장갑 연결에는 BLE가 포함된 개발 빌드가 필요합니다.");
  }
  if (!manager) {
    manager = new BleManager();
  }

  return manager;
}

export function getConnectedSmartGloveName() {
  const names = Object.values(connectedDevices)
    .map((device) => device?.name ?? device?.localName ?? device?.id)
    .filter(Boolean);

  return names.length > 0 ? names.join(", ") : null;
}

export function getConnectedSmartGloveSides() {
  return SMART_GLOVE_SIDES.filter((side) => connectedDevices[side]);
}

export function getConnectedSmartGloveTitle() {
  const sides = getConnectedSmartGloveSides();

  if (sides.includes("LEFT") && sides.includes("RIGHT")) return "양손 연결 완료!";
  if (sides.includes("LEFT")) return "왼손 연결 완료!";
  if (sides.includes("RIGHT")) return "오른손 연결 완료!";

  return "연결 완료!";
}

export async function isSmartGloveConnected() {
  const snapshot = connectedDevices;
  try {
    const connectedEntries = await Promise.all(
      Object.entries(snapshot).map(async ([side, device]) => ({
        side: side as Side,
        device,
        connected: await (device?.isConnected().catch(() => false) ?? false)
      }))
    );

    if (connectedDevices !== snapshot) return getConnectedSmartGloveSides().length > 0;
    connectedDevices = connectedEntries.reduce<Partial<Record<Side, Device>>>(
      (nextDevices, entry) => {
        if (entry.connected) nextDevices[entry.side] = entry.device;
        return nextDevices;
      },
      {}
    );

    notifyConnectionListeners();
    return connectedEntries.some((entry) => entry.connected);
  } catch {
    if (connectedDevices !== snapshot) return getConnectedSmartGloveSides().length > 0;
    connectedDevices = {};
    notifyConnectionListeners();
    return false;
  }
}

export async function connectSmartGlove(
  options: ConnectOptions = {}
): Promise<ConnectedSmartGlove> {
  if (connectionAttempt) return connectionAttempt;

  const controller = new AbortController();
  const cancel = () => controller.abort();
  options.signal?.addEventListener("abort", cancel);
  if (options.signal?.aborted) controller.abort();
  connectionController = controller;
  const attempt = connectDevices({ ...options, signal: controller.signal });
  connectionAttempt = attempt;

  try {
    return await attempt;
  } finally {
    options.signal?.removeEventListener("abort", cancel);
    if (connectionAttempt === attempt) {
      connectionAttempt = null;
      connectionController = null;
    }
  }
}

async function connectDevices(options: ConnectOptions): Promise<ConnectedSmartGlove> {
  throwIfCancelled(options.signal);
  const bleManager = getManager();
  await requestBluetoothPermissions();
  throwIfCancelled(options.signal);
  await waitForPoweredOn(bleManager, options.signal);

  if (await isSmartGloveConnected()) {
    const connectedSides = getConnectedSmartGloveSides();
    const missingSides = SMART_GLOVE_SIDES.filter((side) => !connectedSides.includes(side));

    if (missingSides.length === 0) {
      return {
        id: connectedSides.map((side) => connectedDevices[side]?.id).filter(Boolean).join(","),
        name: getConnectedSmartGloveName() ?? "ReMind Gloves",
        side: connectedSides[0] ?? "LEFT"
      };
    }
  }

  options.onStateChange?.("scanning");
  const connectedSides = getConnectedSmartGloveSides();
  const missingSides = SMART_GLOVE_SIDES.filter((side) => !connectedSides.includes(side));
  const scannedDevices = await scanForSmartGloves(bleManager, missingSides, options.signal);
  throwIfCancelled(options.signal);

  options.onStateChange?.("connecting");
  const connectionResults = await Promise.allSettled(
    Object.entries(scannedDevices).map(async ([side, device]) => {
      const cancel = () => { void device.cancelConnection().catch(() => undefined); };
      options.signal?.addEventListener("abort", cancel);
      try {
        throwIfCancelled(options.signal);
        const connectedDevice = await device
          .connect({ timeout: 10000 })
          .then((nextDevice) => nextDevice.discoverAllServicesAndCharacteristics());
        throwIfCancelled(options.signal);
        return [side as Side, connectedDevice] as const;
      } catch (error) {
        await device.cancelConnection().catch(() => undefined);
        throw error;
      } finally {
        options.signal?.removeEventListener("abort", cancel);
      }
    })
  );
  const connectedEntries = connectionResults.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : []
  );
  if (options.signal?.aborted) {
    await Promise.allSettled(connectedEntries.map(([, device]) => device.cancelConnection()));
    throwIfCancelled(options.signal);
  }
  if (connectedEntries.length === 0) {
    const failure = connectionResults.find((result) => result.status === "rejected");
    throw failure?.status === "rejected"
      ? failure.reason
      : new Error("스마트 장갑을 연결하지 못했습니다.");
  }

  connectedDevices = {
    ...connectedDevices,
    ...Object.fromEntries(connectedEntries)
  };

  for (const [side, device] of connectedEntries) {
    disconnectSubscriptions[side]?.remove();
    disconnectSubscriptions[side] = device.onDisconnected(() => {
      if (connectedDevices[side] !== device) return;
      connectedDevices = { ...connectedDevices };
      delete connectedDevices[side];
      notifyConnectionListeners();
    });
  }
  notifyConnectionListeners();

  options.onStateChange?.("connected");
  const nextConnectedSides = getConnectedSmartGloveSides();
  return {
    id: nextConnectedSides.map((side) => connectedDevices[side]?.id).filter(Boolean).join(","),
    name: getConnectedSmartGloveName() ?? "ReMind Gloves",
    side: nextConnectedSides[0] ?? "LEFT"
  };
}

export async function disconnectSmartGlove() {
  connectionController?.abort();
  await connectionAttempt?.catch(() => undefined);
  inputCleanup?.();

  const devices = Object.values(connectedDevices);
  if (devices.length === 0) return;

  try {
    const results = await Promise.allSettled(
      devices.map(async (device) => {
        if (!device) return;

        const isConnected = await device.isConnected();
        if (isConnected) {
          await device.cancelConnection();
        }
      })
    );
    const failure = results.find((result) => result.status === "rejected");
    if (failure?.status === "rejected") throw failure.reason;
  } finally {
    connectedDevices = {};
    notifyConnectionListeners();
  }
}

export async function subscribeSmartGloveInput(options: SubscribeOptions) {
  const devices = Object.entries(connectedDevices).filter(
    (entry): entry is [Side, Device] => Boolean(entry[1])
  );
  if (devices.length === 0) {
    throw new Error("연결된 스마트 장갑이 없습니다.");
  }

  inputCleanup?.();
  const subscriptions: { remove: () => void }[] = [];
  let stopped = false;
  const cleanup = () => {
    stopped = true;
    subscriptions.splice(0).forEach((subscription) => subscription.remove());
    options.signal?.removeEventListener("abort", cleanup);
    if (inputCleanup === cleanup) inputCleanup = null;
  };
  inputCleanup = cleanup;
  options.signal?.addEventListener("abort", cleanup);
  if (options.signal?.aborted) cleanup();

  try {
    await Promise.all(
      devices.map(async ([side, device]) => {
        const notifyCharacteristic = await findSmartGloveNotifyCharacteristic(device);
        if (stopped) return;
        if (!notifyCharacteristic) {
          throw new Error(`${side} 장갑에서 수신 가능한 BLE characteristic을 찾지 못했습니다.`);
        }

        const subscription = notifyCharacteristic.monitor((error, characteristic) => {
          if (stopped) return;
          if (error) {
            options.onError?.(toError(error));
            return;
          }

          const message = decodeBase64(characteristic?.value);
          if (!message) return;

          options.onMessage?.(`${side}:${message}`);
          const input = parseGloveMessage(message);
          if (input) {
            options.onInput(input);
            return;
          }

          const gesture = parseGestureMessage(message);
          if (gesture) {
            options.onInput({ side, gesture });
          }
        });

        subscriptions.push(subscription);
      })
    );
    return cleanup;
  } catch (error) {
    cleanup();
    throw error;
  }
}

async function waitForPoweredOn(bleManager: BleManager, signal?: AbortSignal) {
  throwIfCancelled(signal);
  const currentState = await bleManager.state();
  throwIfCancelled(signal);
  if (currentState === State.PoweredOn) return;
  if (currentState === State.Unsupported) {
    throw new Error("이 기기는 BLE 장갑 연결을 지원하지 않습니다.");
  }
  if (currentState === State.Unauthorized) {
    throw new Error("설정에서 Bluetooth 권한을 허용해주세요.");
  }

  await new Promise<void>((resolve, reject) => {
    let subscription: { remove: () => void } | undefined;
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      subscription?.remove();
      signal?.removeEventListener("abort", cancel);
      if (error) reject(error);
      else resolve();
    };
    const cancel = () => finish(cancelledError());
    const timeout = setTimeout(() => {
      finish(new Error("스마트폰 블루투스를 활성화해주세요."));
    }, 8000);

    signal?.addEventListener("abort", cancel);
    subscription = bleManager.onStateChange((state) => {
      if (state === State.PoweredOn) finish();
      else if (state === State.Unauthorized) finish(new Error("설정에서 Bluetooth 권한을 허용해주세요."));
      else if (state === State.Unsupported) finish(new Error("이 기기는 BLE 장갑 연결을 지원하지 않습니다."));
    }, true);
    if (settled) subscription.remove();
    if (signal?.aborted) cancel();
  });
}

async function requestBluetoothPermissions() {
  if (Platform.OS !== "android") return;

  if (Platform.Version >= 31) {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    ]);

    const scanGranted =
      result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
      PermissionsAndroid.RESULTS.GRANTED;
    const connectGranted =
      result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
      PermissionsAndroid.RESULTS.GRANTED;

    if (!scanGranted || !connectGranted) {
      throw new Error("Bluetooth 권한을 허용해야 장갑을 연결할 수 있습니다.");
    }

    return;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  if (result !== PermissionsAndroid.RESULTS.GRANTED) {
    throw new Error("위치 권한을 허용해야 BLE 장갑을 검색할 수 있습니다.");
  }
}

async function scanForSmartGloves(
  bleManager: BleManager,
  targetSides: Side[] = SMART_GLOVE_SIDES,
  signal?: AbortSignal
): Promise<Partial<Record<Side, Device>>> {
  throwIfCancelled(signal);
  return await new Promise<Partial<Record<Side, Device>>>((resolve, reject) => {
    let settled = false;
    const foundDevices: Partial<Record<Side, Device>> = {};

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      signal?.removeEventListener("abort", cancel);
      void bleManager.stopDeviceScan().catch(() => undefined);
      if (error) reject(error);
      else resolve(foundDevices);
    };
    const cancel = () => finish(cancelledError());
    const timeout = setTimeout(() => {
      if (foundDevices.LEFT || foundDevices.RIGHT) {
        finish();
        return;
      }

      const missingSides = [
        foundDevices.LEFT ? null : "왼손",
        foundDevices.RIGHT ? null : "오른손"
      ]
        .filter(Boolean)
        .join(", ");

      finish(
        new Error(
          `${missingSides} 스마트 장갑을 찾지 못했습니다. BLE 이름을 확인해주세요.`
        )
      );
    }, SCAN_TIMEOUT_MS);

    signal?.addEventListener("abort", cancel);
    void bleManager.startDeviceScan(null, null, (error, device) => {
      if (settled) return;

      if (error) {
        finish(toError(error));
        return;
      }

      if (!device) return;

      const side = getSmartGloveSide(device);
      if (!side) return;
      if (!targetSides.includes(side)) return;

      foundDevices[side] = device;
      if (!targetSides.every((targetSide) => foundDevices[targetSide])) return;

      finish();
    }).catch((error) => finish(toError(error)));
    if (signal?.aborted) cancel();
  });
}

function getSmartGloveSide(device: Device): Side | null {
  const names = [device.name, device.localName].filter(
    (name): name is string => Boolean(name)
  );

  for (const name of names) {
    const side = SMART_GLOVE_DEVICE_SIDES[name];
    if (side) return side;
  }

  return null;
}

async function findSmartGloveNotifyCharacteristic(device: Device) {
  const characteristics = await device.characteristicsForService(SERVICE_UUID);
  const targetUuid = CHARACTERISTIC_UUID.toLowerCase();

  return (
    characteristics.find(
      (characteristic) =>
        characteristic.uuid.toLowerCase() === targetUuid &&
        (characteristic.isNotifiable || characteristic.isIndicatable)
    ) ?? null
  );
}

function decodeBase64(value?: string | null) {
  if (!value) return null;

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let output = "";
  let buffer = 0;
  let bits = 0;

  for (const char of value.replace(/\s/g, "")) {
    if (char === "=") break;

    const index = chars.indexOf(char);
    if (index < 0) continue;

    buffer = (buffer << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
}

function toError(error: BleError | Error) {
  return new Error(error.message);
}

function cancelledError() {
  const error = new Error("장갑 연결이 취소되었습니다.");
  error.name = "AbortError";
  return error;
}

function throwIfCancelled(signal?: AbortSignal) {
  if (signal?.aborted) throw cancelledError();
}
