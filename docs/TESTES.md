# Checklist de testes

## Aplicação web

- [ ] `pnpm build` termina sem erro.
- [ ] `pnpm check:geometry` termina sem erro.
- [ ] A cena 3D aparece em navegador com WebGL.
- [ ] Rotação, zoom e centralização funcionam.
- [ ] Todas as vistas predefinidas enquadram a maquete.
- [ ] Ocultar e exibir a cobertura não quebra a cena.
- [ ] Clique direto na cancela abre/fecha o estado visual.
- [ ] Botões de abrir e fechar acompanham a cena.
- [ ] Vagas 01 a 04 atualizam LEDs, carros e contadores no modo demonstração.
- [ ] Vaga 05 PCD não entra nos controles nem nos contadores monitorados.
- [ ] A interface continua utilizável em tela estreita.

## ESP32 A — sensores e LEDs

- [ ] Cada sensor HC-SR04 possui proteção de nível lógico no Echo.
- [ ] A leitura de cada vaga corresponde ao sensor físico correto.
- [ ] Distância inferior a 5 cm ocupa a vaga conforme o firmware original.
- [ ] Duas leituras válidas de liberação desocupam uma vaga previamente ocupada.
- [ ] Cada LED vermelho/verde corresponde à sua vaga.
- [ ] A vaga PCD permanece sem sensor e LED.
- [ ] A placa inicializa sem problema de boot relacionado a GPIO 12 e 15.

## ESP32 B — cancela

- [ ] Endereço I²C, pinos e canal do PCA9685 foram confirmados na montagem real.
- [ ] Servo possui fonte adequada e terra comum.
- [ ] Pulso de abrir foi validado sem forçar o mecanismo.
- [ ] Pulso de fechar foi validado sem forçar o mecanismo.
- [ ] A versão final não alterna a cancela automaticamente.
- [ ] O comando do software é identificado como posição estimada se não houver fim de curso.

## Rede e integração futura

- [ ] ESP32 A e B alcançam o serviço pela rede local.
- [ ] Nenhum SSID, senha ou token está rastreado pelo Git.
- [ ] Queda de Wi-Fi deixa o painel em estado offline, sem apresentar dado antigo como atual.
- [ ] Reconexão restaura o estado mais recente com timestamp.
- [ ] Comandos duplicados da cancela são bloqueados durante uma operação pendente.
- [ ] CORS, firewall e autenticação foram testados na rede de apresentação.

## Apresentação no SENAI

- [ ] O projeto foi clonado em outro computador ou a versão compilada foi testada.
- [ ] O navegador do computador de apresentação possui WebGL habilitado.
- [ ] A aplicação não depende de caminhos pessoais do computador de desenvolvimento.
- [ ] Se houver integração física, a rede local foi testada no local da apresentação.
