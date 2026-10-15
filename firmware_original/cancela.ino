// Código original fornecido pelo usuário, ainda com alternância automática.
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
Adafruit_PWMServoDriver pca9685 = Adafruit_PWMServoDriver();
#define SERVOMIN 150
#define SERVOMAX 500
const int CANAL_SERVO = 0;
int anguloParaPulso(int angulo) {
  return map(angulo, 0, 90, SERVOMIN, SERVOMAX);
}
void setup() {
  Serial.begin(9600);
  pca9685.begin();
  pca9685.setPWMFreq(50);
  pca9685.setPWM(CANAL_SERVO, 0, SERVOMIN);
  delay(1000);
}
void loop() {
  Serial.println("Fechando catraca...");
  pca9685.setPWM(CANAL_SERVO, 0, 520);
  delay(3000);
  Serial.println("Abrindo catraca...");
  pca9685.setPWM(CANAL_SERVO, 0, 325);
  delay(3000);
}
