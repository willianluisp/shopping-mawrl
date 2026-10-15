# Arquitetura

## Estado atual

O repositório contém uma aplicação web estática em React. Ela não abre conexões HTTP, WebSocket ou Wi-Fi; o estado das vagas e da cancela é mantido localmente para demonstração em [`src/data/demo.ts`](../src/data/demo.ts).

```text
App.tsx
  ├─ controla vagas de demonstração, vista, teto e cancela
  ├─ atualiza métricas e painel
  └─ envia o estado à cena

ParkingModel.tsx
  ├─ constrói a geometria Three.js
  ├─ anima visualmente a cancela
  ├─ responde ao clique no objeto 3D
  └─ oferece rotação e zoom por OrbitControls

model.ts
  └─ reúne dimensões da maquete e estimativas editáveis
```

As quatro vagas convencionais recebem um estado booleano de demonstração. A vaga 05 é PCD, existe fisicamente no modelo e não recebe estado inferido, carro automático ou LED. Por isso, os contadores usam somente as quatro vagas monitoradas.

## Cena e geometria

As medidas físicas conhecidas da maquete — base de aproximadamente 40 × 38 cm, pavimento superior a 13,5 cm e cobertura a 8 cm acima dele — servem de referência. A configuração em `src/config/model.ts` também contém proporções visuais para itens que ainda não foram medidos individualmente.

O comando `pnpm check:geometry` testa a rota configurada entre rua, trecho plano, cancela, rampa, patamar, corredor superior e vagas. É uma verificação geométrica de software; não mede nem certifica a maquete física.

## Integração prevista

Quando a etapa de hardware começar, a arquitetura esperada será:

```text
ESP32 A (HC-SR04 + LEDs) ─┐
                           ├─ serviço local autenticado ─ WebSocket/HTTP ─ navegador
ESP32 B (PCA9685 + servo) ┘
```

Essa camada intermediária ainda não existe. Ela deve validar mensagens, manter o último estado conhecido, sinalizar dispositivos offline e impedir que um comando de servo seja exibido como confirmação mecânica de posição.

Uma proposta anterior de mensagens inclui estados de vagas, comandos de abrir/fechar e confirmações de comando. O protocolo definitivo, a autenticação e o endereço do serviço devem ser definidos somente depois dos testes de rede e dos firmwares finais.
