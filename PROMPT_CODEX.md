# INSTRUÇÃO PRINCIPAL AO CODEX — SHOPPING MAWRL

Você está trabalhando no projeto escolar **Estacionamento Inteligente SHOPPING MAWRL**. Leia `PROJETO.md`, examine todas as fotos em `referencias/`, com PRIORIDADE ABSOLUTA para `IMG_6445.jpeg` até `IMG_6449.jpeg`, e consulte os códigos em `firmware_original/` somente para entender o hardware. Não altere os originais.

## TAREFA DESTA SESSÃO: CONSTRUIR O SITE 3D (NÃO CONFIGURAR WI-FI AINDA)
Crie do zero um projeto funcional com React, Vite, TypeScript, Three.js, React Three Fiber e Drei. Entregue uma página elegante, natural e profissional, inspirada no layout isométrico do Rollpark, mas com identidade visual própria SHOPPING MAWRL. Priorize a fidelidade geométrica às fotos REAIS mais recentes, não a uma imagem conceitual antiga.

O site deve conter um **modelo 3D verdadeiro, interativo, não vídeo**: base ~40 x 38 cm em escala proporcional, térreo ~13,5 cm, nível superior até teto ~8 cm, rampa lateral direita de ~7 cm, rua ~13 cm e calçada ~3 cm. Fachada azul com letras brancas SHOPPING MAWRL, fechamento escuro/refletivo no térreo, laterais cinzas, quatro vagas superiores sob cobertura com luzes vermelhas/verdes, carros, rampa preta com setas brancas, pista frontal com marcações e cancela amarela/preta na frente direita. Não invente árvores, lojas internas ou placa no teto. Dimensões não fornecidas são estimativas editáveis em um único arquivo de configuração.

Controles: arrastar para orbitar, scroll/pinça para zoom, botão de restaurar câmera, animação suave opcional de rotação. Painel com 4 vagas, total/livres/ocupadas, indicador de modo demonstração e estado da cancela. Permita clicar na cancela 3D OU em botão de abrir/fechar; ambas as ações usam o mesmo estado e fazem animação coerente da haste. Não fechar automaticamente por temporizador. Simular a ocupação das vagas apenas em um painel de demonstração claramente rotulado, e refletir imediatamente nas luzes, carros e contadores. Mostrar interface responsiva no celular e computador.

Arquitetura de código organizada, componentes 3D separados, estado centralizado, configuração de medidas, tipos para estados de vagas e cancela, camada de dados abstrata preparada para futura integração com servidor. Não afirmar que o hardware já está conectado. NÃO implementar backend/Wi-Fi nesta sessão, a menos que solicitado depois. Não usar banco de dados.

## HARDWARE REAL (SOMENTE PARA PREPARAR INTEGRAÇÃO FUTURA)
Duas ESP32 independentes: A controla 4 HC-SR04 + LEDs; B controla PCA9685/servo. A pinagem correta está no firmware original. Cancela: PWM de referência 325 para abrir, 520 para fechar (testes físicos de limites necessários). Código atual da cancela foi temporizado; o usuário quer controle manual, mantendo a posição até outro comando. Ao integrar futuramente, não declarar movimento físico confirmado apenas por ACK de software.

## ENTREGA
Implemente o código, instale dependências e rode `npm run build`. Corrija erros, informe os comandos para executar (`npm install`, `npm run dev`), descreva os arquivos e o que está pronto versus o que depende da rede/hardware. Tire screenshot/inspecione a UI se o ambiente permitir. Se a geometria ficar diferente das fotos, ajuste antes de avançar. NÃO deixe apenas mockup estático ou pseudocódigo.
