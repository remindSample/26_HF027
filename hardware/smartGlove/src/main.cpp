#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLECharacteristic *pCharacteristic;

bool deviceConnected = false;

// =========================
// 플렉스 센서 설정
// =========================
const int FLEX_SENSOR_PINS[] = {39, 34, 35};
const int FLEX_SENSOR_COUNT = 3;

// 센서값이 60 이상이면 굽힌 것으로 판정
const int GESTURE_THRESHOLD = 60;

// 노이즈 완화를 위해 한 센서당 5회 측정 후 평균
const int SAMPLE_COUNT = 5;

// =========================
// BLE 반복 전송 설정
// =========================

// 같은 자세여도 700ms가 지나면 다시 전송
const unsigned long NOTIFY_INTERVAL_MS = 700;

unsigned long lastNotifyMs = 0;

const char *lastPose = "";


// =========================
// 왼손 / 오른손 설정
// =========================
#ifdef GLOVE_SIDE_RIGHT

const char *DEVICE_NAME = "ReMind Right Glove";
const char *GLOVE_SIDE = "RIGHT";

#else

const char *DEVICE_NAME = "ReMind Left Glove";
const char *GLOVE_SIDE = "LEFT";

#endif


// =========================
// BLE 연결 상태 처리
// =========================
class MyServerCallbacks : public BLEServerCallbacks {

  void onConnect(BLEServer *pServer) {
    deviceConnected = true;

    Serial.println("BLE 연결됨");
  }

  void onDisconnect(BLEServer *pServer) {
    deviceConnected = false;

    Serial.println("BLE 연결 해제됨");

    // 연결이 끊기면 다시 BLE 검색 가능 상태로 전환
    BLEDevice::startAdvertising();
  }
};


// =========================
// 센서값 평균 처리
// =========================
int readFlexSmoothed(int pin) {

  int total = 0;

  for (int i = 0; i < SAMPLE_COUNT; i++) {
    total += analogRead(pin);
    delay(2);
  }

  return total / SAMPLE_COUNT;
}


// =========================
// 손가락 굽힘 판정
// =========================
bool isFingerBent(int value) {

  return value >= GESTURE_THRESHOLD;
}


// =========================
// FIST / PALM 판정
// =========================
const char *detectPose(int values[]) {

  int bentCount = 0;

  for (int i = 0; i < FLEX_SENSOR_COUNT; i++) {

    if (isFingerBent(values[i])) {
      bentCount++;
    }
  }

  // 센서 3개 중 2개 이상 굽힘
  if (bentCount >= 2) {
    return "FIST";
  }

  // 센서 0개 또는 1개만 굽힘
  return "PALM";
}


// =========================
// 초기 설정
// =========================
void setup() {

  Serial.begin(115200);

  Serial.println();
  Serial.println("ESP32 시작");

  // -------------------------
  // BLE 초기화
  // -------------------------
  BLEDevice::init(DEVICE_NAME);

  BLEServer *pServer =
      BLEDevice::createServer();

  pServer->setCallbacks(
      new MyServerCallbacks()
  );

  BLEService *pService =
      pServer->createService(
          SERVICE_UUID
      );

  pCharacteristic =
      pService->createCharacteristic(
          CHARACTERISTIC_UUID,
          BLECharacteristic::PROPERTY_NOTIFY
      );

  pCharacteristic->addDescriptor(
      new BLE2902()
  );

  pService->start();

  BLEAdvertising *pAdvertising =
      BLEDevice::getAdvertising();

  pAdvertising->start();

  Serial.printf(
      "BLE 시작됨: %s\n",
      DEVICE_NAME
  );

  Serial.println(
      "BLE 연결 대기 중..."
  );
}


// =========================
// 반복 실행
// =========================
void loop() {

  int values[FLEX_SENSOR_COUNT];


  // -------------------------
  // 센서값 읽기
  // -------------------------
  for (int i = 0; i < FLEX_SENSOR_COUNT; i++) {

    values[i] =
        readFlexSmoothed(
            FLEX_SENSOR_PINS[i]
        );
  }


  // -------------------------
  // 평균값 계산
  // 모니터 확인용이며
  // 실제 FIST/PALM 판정에는 사용하지 않음
  // -------------------------
  int average =
      (values[0] +
       values[1] +
       values[2])
      / FLEX_SENSOR_COUNT;


  // -------------------------
  // 자세 판정
  // -------------------------
  const char *pose =
      detectPose(values);


  // -------------------------
  // 몇 개 센서가 굽혀졌는지 계산
  // -------------------------
  int bentCount = 0;

  for (int i = 0; i < FLEX_SENSOR_COUNT; i++) {

    if (isFingerBent(values[i])) {
      bentCount++;
    }
  }


  // =========================
  // Serial Monitor 출력
  // =========================
  Serial.printf(
      "POSE:%s | "
      "39:%d 34:%d 35:%d | "
      "bent:%d/3 | "
      "avg:%d | "
      "threshold:%d\n",

      pose,

      values[0],
      values[1],
      values[2],

      bentCount,

      average,

      GESTURE_THRESHOLD
  );


  // =========================
  // BLE 전송
  // =========================
  if (deviceConnected) {

    unsigned long now =
        millis();

    // 이전 자세와 다른지 확인
    bool poseChanged =
        strcmp(
            pose,
            lastPose
        ) != 0;

    // 마지막 전송 후 700ms가 지났는지 확인
    bool cooldownPassed =
        now - lastNotifyMs
        >= NOTIFY_INTERVAL_MS;


    // 자세가 바뀌었거나,
    // 같은 자세라도 700ms가 지났으면 전송
    if (poseChanged || cooldownPassed) {

      char buf[24];

      snprintf(
          buf,
          sizeof(buf),
          "%s,%s",
          GLOVE_SIDE,
          pose
      );

      pCharacteristic->setValue(buf);

      pCharacteristic->notify();

      lastPose = pose;

      lastNotifyMs = now;


      Serial.printf(
          "BLE SEND: %s\n",
          buf
      );
    }
  }


  // 센서 판정 주기
  delay(100);
}