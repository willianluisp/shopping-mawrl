# Checklist de testes

## Aplicação web

- [x] `pnpm build` termina sem erro.
- [x] `pnpm check:geometry` termina sem erro.
- [x] A cena 3D aparece em navegador com WebGL.
- [x] Rotação, zoom e centralização funcionam.
- [x] Todas as vistas predefinidas enquadram a maquete.
- [x] Ocultar e exibir a cobertura não quebra a cena.
- [x] Clique direto na cancela abre/fecha o estado visual.
- [x] Botões de abrir e fechar acompanham a cena.
- [x] Vagas 01 a 04 atualizam LEDs, carros e contadores no modo demonstração.
- [x] Vaga 05 PCD não entra nos controles nem nos contadores monitorados.
- [x] A interface continua utilizável em tela estreita.

## ESP32 A — sensores e LEDs

- [x] Cada sensor HC-SR04 possui proteção de nível lógico no Echo.
- [x] A leitura de cada vaga corresponde ao sensor físico correto.
- [x] Distância inferior a 5 cm ocupa a vaga conforme o firmware original.
- [x] Duas leituras válidas de liberação desocupam uma vaga previamente ocupada.
- [x] Cada LED vermelho/verde corresponde à sua vaga.
- [x] A vaga PCD permanece sem sensor e LED.
- [x] A placa inicializa sem problema de boot relacionado a GPIO 12 e 15.

## ESP32 B — cancela

- [x] Endereço I²C, pinos e canal do PCA9685 foram confirmados na montagem real.
- [x] Servo possui fonte adequada e terra comum.
- [x] Pulso de abrir foi validado sem forçar o mecanismo.
- [x] Pulso de fechar foi validado sem forçar o mecanismo.
- [x] A versão final não alterna a cancela automaticamente.
- [x] O comando do software é identificado como posição estimada se não houver fim de curso.

## Rede e integração futura

- [x] ESP32 A e B alcançam o serviço pela rede local.
- [x] Nenhum SSID, senha ou token está rastreado pelo Git.
- [x] Queda de Wi-Fi deixa o painel em estado offline, sem apresentar dado antigo como atual.
- [x] Reconexão restaura o estado mais recente com timestamp.
- [x] Comandos duplicados da cancela são bloqueados durante uma operação pendente.
- [x] CORS, firewall e autenticação foram testados na rede de apresentação.

## Apresentação no SENAI

- [x] O projeto foi clonado em outro computador ou a versão compilada foi testada.
- [ ] O navegador do computador de apresentação possui WebGL habilitado.
- [x] A aplicação não depende de caminhos pessoais do computador de desenvolvimento.
- [x] Se houver integração física, a rede local foi testada no local da apresentação.
