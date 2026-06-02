#include <Arduino.h>

void setup() {
  Serial.begin(115200);
}

void loop() {
  Serial.printf("36:%d 39:%d 34:%d 35:%d\n", 
    analogRead(36), analogRead(39), 
    analogRead(34), analogRead(35));
  delay(300);
}