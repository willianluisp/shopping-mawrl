// Código original fornecido pelo usuário, sem modificações de lógica.
const int NUM = 4;
const int trigPins[NUM] = { 4, 5, 13, 14 };
const int echoPins[NUM] = { 34, 35, 36, 39 };
const int ledR[NUM] = { 25, 32, 12, 19 };
const int ledG[NUM] = { 26, 33, 15, 21 };
const int ledB[NUM] = { 27, 23, 18, 22 };
#define SOUND_SPEED 0.034
const float DISTANCIA_LIMITE = 5.0;
const int LEITURAS_PARA_LIBERAR = 2;
bool ocupado[NUM];
int contLivre[NUM];
int semLeitura[NUM];
float lerDistancia(int trig, int echo) {
  digitalWrite(trig, LOW); delayMicroseconds(2);
  digitalWrite(trig, HIGH); delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long duration = pulseIn(echo, HIGH, 30000);
  if (duration == 0) return -1;
  return duration * SOUND_SPEED / 2;
}
void atualizarLed(int i) {
  digitalWrite(ledR[i], ocupado[i] ? HIGH : LOW);
  digitalWrite(ledG[i], ocupado[i] ? LOW : HIGH);
}
void setup() {
  Serial.begin(115200);
  for (int i = 0; i < NUM; i++) {
    pinMode(trigPins[i], OUTPUT); pinMode(echoPins[i], INPUT);
    digitalWrite(trigPins[i], LOW);
    pinMode(ledR[i], OUTPUT); pinMode(ledG[i], OUTPUT); pinMode(ledB[i], OUTPUT);
    digitalWrite(ledB[i], LOW);
    ocupado[i] = false; contLivre[i] = 0; semLeitura[i] = 0;
    atualizarLed(i);
  }
}
void loop() {
  for (int i = 0; i < NUM; i++) {
    float dist = lerDistancia(trigPins[i], echoPins[i]);
    Serial.print("Sensor "); Serial.print(i + 1); Serial.print(": ");
    if (dist < 0) {
      semLeitura[i]++; Serial.print("sem leitura");
      if (semLeitura[i] >= 20) Serial.print("  <-- verifique fiacao/divisor deste sensor");
      Serial.println();
    } else {
      semLeitura[i] = 0; Serial.print(dist); Serial.println(" cm");
    }
    if (dist >= 0 && dist < DISTANCIA_LIMITE) {
      ocupado[i] = true; contLivre[i] = 0;
    } else if (dist >= DISTANCIA_LIMITE) {
      if (ocupado[i]) {
        contLivre[i]++;
        if (contLivre[i] >= LEITURAS_PARA_LIBERAR) {
          ocupado[i] = false; contLivre[i] = 0;
        }
      }
    }
    atualizarLed(i); delay(30);
  }
  Serial.println("---"); delay(30);
}
