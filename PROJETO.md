# SHOPPING MAWRL — Estacionamento Inteligente

## Objetivo
Construir um site responsivo com gêmeo digital 3D interativo da maquete física SHOPPING MAWRL, monitorando quatro vagas em tempo real pelo ESP32 e permitindo acionar uma cancela física e refletir seu estado no 3D.

## Referência obrigatória
Consultar as seis fotografias em `referencias/` antes de modelar. A construção real prevalece sobre qualquer imagem conceitual. Fachada frontal azul com letreiro SHOPPING MAWRL, térreo com grande abertura frontal e interior simples, estacionamento superior coberto, quatro vagas, indicadores luminosos no teto, rampa lateral direita (vista frontal), rua preta com sinalização branca e amarela, calçada, cancela amarela e preta na entrada. Laterais cinzas. Não adicionar placa grande no teto, árvores, vitrines ou estruturas não existentes sem aprovação.

## Dimensões reais informadas
- Largura total da ponta da estrada à outra: 40 cm.
- Profundidade total da maquete: 38 cm.
- Altura do térreo até o segundo andar: 13,5 cm.
- Altura do segundo andar até o teto: 8 cm.
- Soma das alturas entre níveis: 21,5 cm (não inclui espessuras adicionais).
- Largura da rampa: 7 cm.
- Largura da estrada: 13 cm.
- Largura da calçada: 3 cm.
- Quatro sensores de vagas.
- Cancela física já funciona.
As dimensões individuais de cada vaga, inclinação/comprimento da rampa e dimensões da cancela ainda não foram medidas: usar proporções visuais ajustáveis, documentando hipóteses, sem apresentá-las como medidas reais.

## Requisitos do site
1. Visual profissional, inspirado no layout de referência Rollpark, mas identidade SHOPPING MAWRL e geometria da maquete real.
2. Cena 3D com rotação, zoom, iluminação, perspectiva isométrica inicial e opção de centralizar a câmera.
3. Quatro vagas identificadas, com indicação de livre/ocupada em painel e na cena, LEDs virtuais associados aos indicadores físicos.
4. Contadores de vagas totais, livres e ocupadas, calculados a partir do estado recebido.
5. Controle da cancela por botão, com estados de solicitada, abrindo, aberta, fechando, fechada e erro conforme capacidades reais do firmware. Não apresentar sucesso antes de confirmação do dispositivo.
6. Estado de conexão (online/offline), reconexão e comportamento seguro para dados desatualizados.
7. Modo demonstração separado e explicitamente identificado, sem simular conexão real.
8. Não criar histórico ou banco de dados nesta etapa.

## Arquitetura inicial proposta
- Frontend: React + Vite + React Three Fiber + Drei.
- Backend: Node.js com WebSocket para distribuir estados e transmitir comandos.
- ESP32 via Wi-Fi e protocolo a escolher depois de examinar o firmware existente. Evitar impor protocolo incompatível.
- O estado verdadeiro das vagas vem dos sensores/ESP32. Para a cancela, usar confirmação real de firmware ou retorno de execução, distinguindo confirmação de comando e posição física efetivamente medida (caso não exista sensor de posição).
- Não colocar credenciais de Wi-Fi, segredos ou endereços privados em código público.

## Fluxo funcional
Sensor de vaga -> ESP32 -> atualização do LED físico -> mensagem de estado -> backend -> painel e cena 3D.
Botão no site -> backend -> ESP32 -> servo/cancela -> resposta de execução -> animação e status no site.

## Etapas para o Codex
1. Inspecionar as fotos e criar a estrutura do projeto, com componentes e medidas centralizadas em arquivo de configuração.
2. Criar a cena 3D da maquete física, mantendo os detalhes de fachada, rampa, pavimentos, vagas e sinalização. Revisar visual antes de integrar hardware.
3. Criar painel responsivo e dados de demonstração claramente rotulados.
4. Examinar o código real do ESP32 quando fornecido; definir protocolo, eventos, reconexão e confirmação da cancela.
5. Integrar e testar ponta a ponta, inclusive queda de conexão e comando sem confirmação.

## Informações pendentes
- Código atual completo do ESP32 e bibliotecas utilizadas.
- Pinagem de sensores, LEDs, servo e módulos adicionais.
- Como o ESP32 se comunica hoje (Wi-Fi, serial, MQTT, HTTP, etc.).
- Se existe detecção de posição da cancela ou apenas comando de servo.
- Se há displays OLED/LCD e se devem participar do site.
- Fotos adicionais do piso superior em vista de cima, se disponíveis.

## Critérios de aceite
A geometria visual corresponde às fotos; quatro vagas e estados consistentes; LEDs virtuais acompanham leituras reais; contadores corretos; botão aciona a cancela real sem declarar abertura não confirmada; aplicação distingue modo demonstração de operação conectada; funciona no computador e no celular.

## Atualização — firmware recebido e controle manual (14/10/2026)

### Firmware existente
- Quatro HC-SR04: TRIG `{4,5,13,14}`, ECHO `{34,35,36,39}`; ECHO deve usar divisor de tensão apropriado para entradas 3,3 V.
- LEDs HW-479 de cátodo comum: vermelho `{25,32,12,19}`, verde `{26,33,15,21}`, azul `{27,23,18,22}`. O código atual deixa azul desligado.
- Ocupação: distância válida inferior a 5 cm = ocupada imediatamente; libera após duas leituras válidas >= 5 cm; sem leitura conserva último estado. O frontend deve distinguir dado desatualizado e estado desconhecido ao desconectar.
- Servo via PCA9685 endereço padrão 0x40, canal 0, 50 Hz; pulsos atuais de teste: 520 (rotulado FECHAR) e 325 (rotulado ABRIR). Testar e confirmar sentidos antes de uso; 520 excede o `SERVOMAX` declarado de 500, que não é aplicado no loop. Não converter esses valores automaticamente em ângulos.
- Firmware da cancela hoje alterna automaticamente a cada 3 segundos; requisito novo: REMOVER a alternância, abrir ou fechar somente por comando explícito do site, permanecer na posição até próximo comando. Permitir controle clicando no objeto da cancela 3D OU no botão do painel. Bloquear comandos repetidos enquanto houver operação pendente.

### Conflitos elétricos e validações obrigatórias antes de juntar códigos
- Tabela da foto difere do código para LED 3: foto R=16/G=17, firmware R=12/G=15. Confirmar ligação REAL antes de qualquer alteração.
- O PCA9685 usa I2C, geralmente SDA=21 e SCL=22 no ESP32; firmware atual usa GPIO21 para verde do LED4 e GPIO22 para azul do LED4. Se os módulos estiverem no MESMO ESP32 e I2C padrão, há conflito físico. Verificar se estão usando duas placas e, caso seja uma, definir pinos I2C livres/remapear LEDs com segurança e atualizar fiação + firmware em conjunto.
- GPIO12 e GPIO15 são pinos de strapping/boot no ESP32 clássico. Confirmar que a montagem não interfere no boot.
- A confirmação por software de um comando ao PCA9685 NÃO equivale a medir a posição real da cancela. Sem sensor de posição, apresentar “comando executado / posição estimada”, não “posição física confirmada”.
- Nunca enviar Wi-Fi SSID/senha em arquivos versionados; usar configuração local ignorada no Git.

### Contrato de comunicação proposto (ajustável)
- `parking.state`: `{type:"parking.state", spots:[true,false,false,true], timestamp:...}` onde `true` significa ocupada; backend valida formato e retransmite aos navegadores.
- `gate.command`: `{type:"gate.command", requestId:"...", action:"open"|"close"}` do site ao backend e ao ESP32.
- `gate.ack`: `{type:"gate.ack", requestId:"...", accepted:true}` significa apenas comando aceito.
- `gate.state`: `{type:"gate.state", state:"open"|"closed"|"moving"|"error", basis:"servo_command"}` significa estado informado pelo firmware; não confundir com leitura de sensor físico.
- Proteger endpoints de comando (autenticação simples e/ou rede local) para impedir acionamento por visitantes não autorizados. Definir implantação e protocolo exatos depois de conhecer a rede de apresentação.

### Critérios adicionais de aceite
- Sem temporizador de fechamento automático.
- Clique na cancela 3D e botão acionam o mesmo comando, com estados de pendência e falha.
- Vagas atualizam independentemente da cancela.
- Sem ligação ao ESP32, interface não apresenta estados simulados como dados reais.

## CONFIRMAÇÃO FINAL — DUAS ESP32 (14/10/2026)
- **ESP32 A (vagas):** exclusiva dos quatro HC-SR04 e quatro LEDs RGB. A pinagem verdadeira é a dos arrays do arquivo `firmware_original/estacionamento.ino`, inclusive LED 3 vermelho GPIO12 e verde GPIO15. Não trocar pelos valores da foto/tabela antiga. Echo dos HC-SR04 deve ter divisor de tensão para 3,3 V. Considerar riscos dos GPIO12/15 de boot e evitar mudanças sem testes.
- **ESP32 B (cancela):** exclusiva do PCA9685 e servo, canal 0, endereço I2C 0x40, 50 Hz. GPIO21 SDA e GPIO22 SCL **se confirmado na ligação física**, sem conflito com a outra ESP32. O firmware original usa pulso 325 para 'abrir' e 520 para 'fechar'; confirmar orientação e limites reais em teste. Não alimentar servo pelo 3,3 V da placa; usar alimentação compatível, terra comum e observar níveis lógicos I2C.
- **Rede:** ambas conectam via Wi-Fi à mesma instância do backend Node.js; navegador React/3D conecta ao backend. Preferência inicial por WebSocket bidirecional com identificação de dispositivo e autenticação simples por token de dispositivo, sem segredos no frontend. Em desenvolvimento local usar endereço LAN acessível pelas ESP32, não `localhost` no firmware. Não expor controles sem autenticação na internet.
- **ESP32 A:** envia estado das 4 vagas ao mudar e heartbeat periódico, com status de leitura inválida e reconexão. LED físico continua funcionando localmente mesmo se Wi-Fi cair. No site, indicar dispositivo offline e não representar dados antigos como atuais.
- **ESP32 B:** recebe comando `open`/`close`, responde com id de comando e estado estimado após aplicar PWM; NÃO confundir confirmação de execução do comando com confirmação mecânica de posição, pois não há sensor de fim de curso confirmado. Remover delays automáticos de alternância; cancela permanece no último estado comandado. Prever timeout e reconexão. O clique no modelo 3D e botão usam o mesmo fluxo, com prevenção de comandos duplicados.
- **Sem banco de dados** para a primeira versão; servidor mantém estado em memória e o reconstitui após reconexão dos dispositivos. Não inventar ocupação na ausência de leitura.
- **Próxima entrega:** construir site React/Vite com React Three Fiber/Drei fiel às fotos, dashboard responsivo e modo demo claramente sinalizado; implementar backend e dois firmwares novos em pastas separadas, sem sobrescrever `firmware_original`. Testar build, fluxo simulado e documentar testes físicos pendentes.

## ATUALIZAÇÃO VISUAL PRIORITÁRIA — FOTOS 14/10/2026
As fotos mais recentes são `referencias/IMG_6445.jpeg` a `IMG_6449.jpeg` e PREVALECEM sobre imagens anteriores em caso de conflito. Observações verificadas:
- Fachada azul com letreiro branco **SHOPPING MAWRL**; área frontal do térreo agora apresenta fechamento escuro/azulado refletivo, não um vão aberto.
- Piso superior coberto, quatro vagas, pequenos carros e LEDs sobre as vagas, com exemplos de LEDs vermelhos e verdes conforme ocupação.
- Rampa preta à direita (vista frontal), duas setas brancas ascendentes; estrada preta frontal com faixas brancas, linhas amarelas e faixa de pedestres.
- Cancela amarela/preta na extremidade direita da frente; fotos mostram posição horizontal e vertical. Animar com eixo/pivô na posição real.
- Laterais e cobertura cinza, fiação aparente na parte posterior; modelo pode simplificar fios sem inventar fachadas ou detalhes de shopping que não existem.
- `IMG_6449.jpeg` mostra claramente quatro módulos e cabos na face posterior superior. NÃO interpretar esses módulos automaticamente como sensores HC-SR04: o firmware é a fonte sobre tipos e funções.
- As imagens são referências de geometria e materiais; não é necessário reproduzir pessoas, sala de aula, carteiras ou fundo fotográfico.
- Vagas e carros devem ser visualizados de modo coerente com o estado; carros virtuais podem surgir/sumir com dados reais, mas a cena inicial demo deve ser identificada como simulação.

## ORDEM DE EXECUÇÃO CONFIRMADA PELO USUÁRIO
1. Código da cancela com comandos manuais via Serial: entregue em conversa, mas seu teste físico após a alteração ainda não foi confirmado. O código original em `firmware_original/cancela.ino` é temporizado e deve permanecer intocado.
2. **AGORA NO CODEX: CRIAR O SITE E O 3D**, com modo demonstração, responsivo, fiel às fotos recentes, clique na cancela 3D e botão com mesma ação visual no modo demo.
3. **DEPOIS: CONFIGURAR WI-FI/INTEGRAÇÃO REAL** com as duas ESP32, servidor e autenticação. Não presumir que já estão na rede.
A cancela deve permanecer aberta ou fechada até novo comando, sem fechamento por tempo. A comunicação de hardware será adicionada posteriormente. Não chamar o modo demo de conexão real.
