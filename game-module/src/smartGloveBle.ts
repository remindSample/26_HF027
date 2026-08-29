import { PermissionsAndroid, Platform } from "react-native";
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
};

type SubscribeOptions = {
  onInput: (input: GloveInput) => void;
  onMessage?: (message: string) => void;
  onError?: (error: Error) => void;
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
let notifySubscriptions: { remove: () => void }[] = [];

function getManager() {
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
  try {
    const connectedEntries = await Promise.all(
      Object.entries(connectedDevices).map(async ([side, device]) => ({
        side: side as Side,
        device,
        connected: await (device?.isConnected() ?? false)
      }))
    );

    connectedDevices = connectedEntries.reduce<Partial<Record<Side, Device>>>(
      (nextDevices, entry) => {
        if (entry.connected) nextDevices[entry.side] = entry.device;
        return nextDevices;
      },
      {}
    );

    return connectedEntries.some((entry) => entry.connected);
  } catch {
    return false;
  }
}

export async function connectSmartGlove(
  options: ConnectOptions = {}
): Promise<ConnectedSmartGlove> {
  const bleManager = getManager();
  await waitForPoweredOn(bleManager);
  await requestBluetoothPermissions();

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
  const scannedDevices = await scanForSmartGloves(bleManager, missingSides);

  options.onStateChange?.("connecting");
  const connectedEntries = await Promise.all(
    Object.entries(scannedDevices).map(async ([side, device]) => {
      const connectedDevice = await device
        .connect({ timeout: 10000 })
        .then((nextDevice) => nextDevice.discoverAllServicesAndCharacteristics());

      return [side as Side, connectedDevice] as const;
    })
  );

  connectedDevices = {
    ...connectedDevices,
    ...Object.fromEntries(connectedEntries)
  };

  options.onStateChange?.("connected");
  const nextConnectedSides = getConnectedSmartGloveSides();
  return {
    id: nextConnectedSides.map((side) => connectedDevices[side]?.id).filter(Boolean).join(","),
    name: getConnectedSmartGloveName() ?? "ReMind Gloves",
    side: nextConnectedSides[0] ?? "LEFT"
  };
}

export async function disconnectSmartGlove() {
  notifySubscriptions.forEach((subscription) => subscription.remove());
  notifySubscriptions = [];

  const devices = Object.values(connectedDevices);
  if (devices.length === 0) return;

  try {
    await Promise.all(
      devices.map(async (device) => {
        if (!device) return;

        const isConnected = await device.isConnected();
        if (isConnected) {
          await device.cancelConnection();
        }
      })
    );
  } finally {
    connectedDevices = {};
  }
}

export async function subscribeSmartGloveInput(options: SubscribeOptions) {
  const devices = Object.entries(connectedDevices).filter(
    (entry): entry is [Side, Device] => Boolean(entry[1])
  );
  if (devices.length === 0) {
    throw new Error("연결된 스마트 장갑이 없습니다.");
  }

  notifySubscriptions.forEach((subscription) => subscription.remove());
  notifySubscriptions = [];

  await Promise.all(
    devices.map(async ([side, device]) => {
      const notifyCharacteristic = await findSmartGloveNotifyCharacteristic(device);
      if (!notifyCharacteristic) {
        throw new Error(`${side} 장갑에서 수신 가능한 BLE characteristic을 찾지 못했습니다.`);
      }

      const subscription = notifyCharacteristic.monitor((error, characteristic) => {
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

      notifySubscriptions.push(subscription);
    })
  );

  return () => {
    notifySubscriptions.forEach((subscription) => subscription.remove());
    notifySubscriptions = [];
  };
}

async function waitForPoweredOn(bleManager: BleManager) {
  const currentState = await bleManager.state();
  if (currentState === State.PoweredOn) return;

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      subscription.remove();
      reject(new Error("스마트폰 블루투스를 활성화해주세요."));
    }, 8000);

    const subscription = bleManager.onStateChange((state) => {
      if (state !== State.PoweredOn) return;
      clearTimeout(timeout);
      subscription.remove();
      resolve();
    }, true);
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
  targetSides: Side[] = SMART_GLOVE_SIDES
): Promise<Partial<Record<Side, Device>>> {
  return await new Promise<Partial<Record<Side, Device>>>((resolve, reject) => {
    let settled = false;
    const foundDevices: Partial<Record<Side, Device>> = {};

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      bleManager.stopDeviceScan();
      if (foundDevices.LEFT || foundDevices.RIGHT) {
        resolve(foundDevices);
        return;
      }

      const missingSides = [
        foundDevices.LEFT ? null : "왼손",
        foundDevices.RIGHT ? null : "오른손"
      ]
        .filter(Boolean)
        .join(", ");

      reject(
        new Error(
          `${missingSides} 스마트 장갑을 찾지 못했습니다. BLE 이름을 확인해주세요.`
        )
      );
    }, SCAN_TIMEOUT_MS);

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (settled) return;

      if (error) {
        settled = true;
        clearTimeout(timeout);
        bleManager.stopDeviceScan();
        reject(toError(error));
        return;
      }

      if (!device) return;

      const side = getSmartGloveSide(device);
      if (!side) return;
      if (!targetSides.includes(side)) return;

      foundDevices[side] = device;
      if (!targetSides.every((targetSide) => foundDevices[targetSide])) return;

      settled = true;
      clearTimeout(timeout);
      bleManager.stopDeviceScan();
      resolve(foundDevices);
    });
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
