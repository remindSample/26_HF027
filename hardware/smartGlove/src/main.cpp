#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// =========================
// BLE UUID
// =========================
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLECharacteristic *pCharacteristic;

bool deviceConnected = false;


// =========================
// 플렉스 센서 설정
// =========================

// 총 4개 센서
// 검지, 중지, 약지, 소지 순서
#ifdef GLOVE_SIDE_RIGHT
const int FLEX_SENSOR_PINS[] = {39, 34, 35, 15};
#else
const int FLEX_SENSOR_PINS[] = {15, 35, 34, 39};
#endif
const int FLEX_SENSOR_COUNT = 4;

// 검지/중지는 900 이상, 약지/소지는 50 이상이면 굽힌 것으로 판정
const int GESTURE_THRESHOLDS[] = {900, 900, 50, 50};

// 노이즈 완화를 위해
// 한 센서당 5회 측정 후 평균
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

  void onConnect(BLEServer *pServer) override {
    deviceConnected = true;

    Serial.println("BLE 연결됨");
  }

  void onDisconnect(BLEServer *pServer) override {
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
bool isFingerBent(int value, int fingerIndex) {

  return value >= GESTURE_THRESHOLDS[fingerIndex];
}


// =========================
// PALM / SCISSORS / FIST 판정
// =========================
const char *detectPose(int values[]) {

  int bentCount = 0;

  // 굽혀진 센서 개수 계산
  for (int i = 0; i < FLEX_SENSOR_COUNT; i++) {

    if (isFingerBent(values[i], i)) {
      bentCount++;
    }
  }


  // =========================
  // 자세 판정
  // =========================

  // 0개 굽힘
  if (bentCount == 0) {
    return "PALM";
  }

  // 1~2개 굽힘
  if (bentCount <= 2) {
    return "SCISSORS";
  }

  // 3~4개 굽힘
  return "FIST";
}


// =========================
// 초기 설정
// =========================
void setup() {

  Serial.begin(115200);

  delay(500);

  Serial.println();
  Serial.println("==============================");
  Serial.println("ReMind Smart Glove 시작");
  Serial.println("==============================");


  // =========================
  // ADC 핀 설정
  // =========================
  for (int i = 0; i < FLEX_SENSOR_COUNT; i++) {
    pinMode(FLEX_SENSOR_PINS[i], INPUT);
  }


  // =========================
  // BLE 초기화
  // =========================
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

  Serial.println();
}


// =========================
// 반복 실행
// =========================
void loop() {

  int values[FLEX_SENSOR_COUNT];


  // =========================
  // 센서값 읽기
  // =========================
  for (int i = 0; i < FLEX_SENSOR_COUNT; i++) {

    values[i] =
        readFlexSmoothed(
            FLEX_SENSOR_PINS[i]
        );
  }


  // =========================
  // 센서 평균값 계산
  // Serial Monitor 확인용
  // =========================
  int total = 0;

  for (int i = 0; i < FLEX_SENSOR_COUNT; i++) {
    total += values[i];
  }

  int average =
      total / FLEX_SENSOR_COUNT;


  // =========================
  // 굽힌 손가락 개수 계산
  // =========================
  int bentCount = 0;

  for (int i = 0; i < FLEX_SENSOR_COUNT; i++) {

    if (isFingerBent(values[i], i)) {
      bentCount++;
    }
  }


  // =========================
  // 자세 판정
  // =========================
  const char *pose =
      detectPose(values);


  // =========================
  // Serial Monitor 출력
  // =========================
  Serial.printf(
      "POSE:%s | "
      "%d:%d %d:%d %d:%d %d:%d | "
      "bent:%d/4 | "
      "avg:%d | "
      "threshold:%d,%d,%d,%d\n",

      pose,

      FLEX_SENSOR_PINS[0], values[0],
      FLEX_SENSOR_PINS[1], values[1],
      FLEX_SENSOR_PINS[2], values[2],
      FLEX_SENSOR_PINS[3], values[3],

      bentCount,

      average,

      GESTURE_THRESHOLDS[0],
      GESTURE_THRESHOLDS[1],
      GESTURE_THRESHOLDS[2],
      GESTURE_THRESHOLDS[3]
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


    // 마지막 전송 후
    // 700ms가 지났는지 확인
    bool cooldownPassed =
        now - lastNotifyMs
        >= NOTIFY_INTERVAL_MS;


    // 자세가 바뀌었거나
    // 같은 자세라도 700ms가 지났으면 전송
    if (poseChanged || cooldownPassed) {

      char buf[32];

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
