#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLECharacteristic *pCharacteristic;
bool deviceConnected = false;

const int FLEX_SENSOR_PINS[] = {39, 34, 35};
const int FLEX_SENSOR_COUNT = 3;
const int CALIBRATION_POSE_MS = 2000;
const int CALIBRATION_SAMPLE_DELAY_MS = 50;

int gestureThreshold = 2200;
bool fistValueIsHigher = true;
const char *lastPose = "";

#ifdef GLOVE_SIDE_RIGHT
const char *DEVICE_NAME = "ReMind Right Glove";
const char *GLOVE_SIDE = "RIGHT";
#else
const char *DEVICE_NAME = "ReMind Left Glove";
const char *GLOVE_SIDE = "LEFT";
#endif

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) { deviceConnected = true; }
  void onDisconnect(BLEServer* pServer) { deviceConnected = false; }
};

int readFlexAverage() {
  int total = 0;
  for (int i = 0; i < FLEX_SENSOR_COUNT; i++) {
    total += analogRead(FLEX_SENSOR_PINS[i]);
  }

  return total / FLEX_SENSOR_COUNT;
}

int readPoseAverage() {
  long total = 0;
  int sampleCount = 0;
  unsigned long startMs = millis();

  while (millis() - startMs < CALIBRATION_POSE_MS) {
    total += readFlexAverage();
    sampleCount++;
    delay(CALIBRATION_SAMPLE_DELAY_MS);
  }

  if (sampleCount == 0) return readFlexAverage();
  return total / sampleCount;
}

void calibrateGestureThreshold() {
  Serial.println("Calibration: open your hand for PALM.");
  delay(1000);
  int palmAverage = readPoseAverage();

  Serial.println("Calibration: make a fist for FIST.");
  delay(1000);
  int fistAverage = readPoseAverage();

  gestureThreshold = (palmAverage + fistAverage) / 2;
  fistValueIsHigher = fistAverage >= palmAverage;

  Serial.printf(
    "Calibration done. palm:%d fist:%d threshold:%d direction:%s\n",
    palmAverage,
    fistAverage,
    gestureThreshold,
    fistValueIsHigher ? "higher" : "lower"
  );
}

bool isFingerBent(int value) {
  return fistValueIsHigher ? value >= gestureThreshold : value <= gestureThreshold;
}

const char *detectPose(int values[]) {
  int bentCount = 0;
  for (int i = 0; i < FLEX_SENSOR_COUNT; i++) {
    if (isFingerBent(values[i])) bentCount++;
  }

  if (bentCount >= 3) return "FIST";
  if (bentCount <= 1) return "PALM";
  return nullptr;
}

void setup() {
  Serial.begin(115200);
  calibrateGestureThreshold();

  BLEDevice::init(DEVICE_NAME);
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  BLEService *pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_NOTIFY
  );
  pCharacteristic->addDescriptor(new BLE2902());
  pService->start();
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->start();
  Serial.println("BLE 시작됨, 연결 대기 중...");
}

void loop() {
  int values[FLEX_SENSOR_COUNT];

  // 센서값 읽기
  for (int i = 0; i < FLEX_SENSOR_COUNT; i++) {
    values[i] = analogRead(FLEX_SENSOR_PINS[i]);
  }

  int average =
    (values[0] + values[1] + values[2]) / FLEX_SENSOR_COUNT;

  // FIST / PALM 판정
  const char *pose = detectPose(values);

  // 판정되지 않은 중간 자세
  const char *displayPose = pose ? pose : "KEEP";

  // ========================================
  // Serial Monitor에는 항상 출력
  // ========================================
  Serial.printf(
    "POSE:%s | values:%d,%d,%d | avg:%d | threshold:%d\n",
    displayPose,
    values[0],
    values[1],
    values[2],
    average,
    gestureThreshold
  );

  // ========================================
  // BLE 연결되어 있을 때 앱으로 전송
  // ========================================
  if (deviceConnected && pose) {

    char buf[24];
    snprintf(buf, sizeof(buf), "%s,%s", GLOVE_SIDE, pose);

    if (strcmp(pose, lastPose) != 0) {
      pCharacteristic->setValue(buf);
      pCharacteristic->notify();

      lastPose = pose;
    }
  }

  delay(300);
}
