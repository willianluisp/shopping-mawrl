# Hardware da maquete

## Visão geral

A maquete utiliza duas ESP32 independentes:

| Placa | Responsabilidade | Situação neste repositório |
| --- | --- | --- |
| ESP32 A | Quatro sensores HC-SR04 e quatro LEDs RGB | Sketch original em `firmware_original/estacionamento.ino` |
| ESP32 B | PCA9685 e servo da cancela | Sketch original em `firmware_original/cancela.ino` |

Os sketches foram mantidos sem alteração. Eles são referência para entender a montagem e não representam a integração Wi-Fi final.

## ESP32 A — vagas, sensores e LEDs

O sketch `estacionamento.ino` declara quatro sensores HC-SR04 e LEDs RGB de cátodo comum:

| Vaga | Trig | Echo | R | G | B |
| --- | ---: | ---: | ---: | ---: | ---: |
| 01 | GPIO 4 | GPIO 34 | GPIO 25 | GPIO 26 | GPIO 27 |
| 02 | GPIO 5 | GPIO 35 | GPIO 32 | GPIO 33 | GPIO 23 |
| 03 | GPIO 13 | GPIO 36 | GPIO 12 | GPIO 15 | GPIO 18 |
| 04 | GPIO 14 | GPIO 39 | GPIO 19 | GPIO 21 | GPIO 22 |

A distância inferior a 5 cm marca a vaga como ocupada. Para liberar uma vaga ocupada, o sketch exige duas leituras válidas iguais ou superiores a 5 cm. Sem leitura válida, ele mantém o último estado. O LED azul é inicializado desligado no firmware original.

A quinta vaga é PCD e não possui sensor ou LED. Portanto, ela não participa do monitoramento eletrônico nem dos contadores de disponibilidade.

### Cuidados elétricos

- O sinal **Echo** de um HC-SR04 normalmente opera em 5 V. Use divisor de tensão ou conversor de nível antes da entrada de 3,3 V da ESP32.
- GPIO 12 e GPIO 15 podem afetar o boot em ESP32 clássicas. Qualquer alteração de fiação nesses pinos exige teste físico.
- Verifique alimentação, terra comum e polaridade dos LEDs antes de energizar a montagem.

## ESP32 B — cancela

O sketch `cancela.ino` usa um PCA9685 com a biblioteca `Adafruit_PWMServoDriver`:

| Item | Valor no sketch original |
| --- | --- |
| Endereço I²C | `0x40` (padrão da biblioteca) |
| Canal do servo | `0` |
| Frequência PWM | `50 Hz` |
| Pulso de abrir | `325` |
| Pulso de fechar | `520` |

Os valores 325 e 520 são referências de teste, não ângulos universais. O valor 520 ultrapassa o `SERVOMAX` declarado no sketch, embora esse limite não seja aplicado no `loop`; valide mecanicamente o conjunto antes de reutilizá-lo.

O código original chama apenas `pca9685.begin()` e não configura pinos I²C. Assim, a pinagem I²C **não está confirmada pelo código**. Em uma ESP32 clássica, GPIO 21 (SDA) e GPIO 22 (SCL) são o padrão comum, mas essa ligação deve ser confirmada fisicamente antes de documentá-la como definitiva. Como a cancela usa outra ESP32, não há conflito automático com GPIO 21 e 22 usados pelos LEDs da placa das vagas.

O sketch atual alterna abrir/fechar a cada três segundos. Ele é legado: a versão de integração deverá aceitar comando explícito, permanecer no último estado e informar somente a execução estimada do comando, pois não há sensor de fim de curso confirmado.

### Alimentação

Não alimente o servo pelo pino de 3,3 V da ESP32. Utilize fonte compatível com o servo e mantenha terra comum entre fonte, PCA9685 e ESP32, respeitando os limites elétricos de cada módulo.
