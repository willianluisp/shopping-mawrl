# Rede e futura integração

## Situação atual

A aplicação atual não se conecta à rede e não contém variáveis de ambiente obrigatórias. Os controles de vagas e cancela são locais e identificados como demonstração.

## Preparação segura

Quando a integração for implementada, mantenha as ESP32 e o computador que executa o serviço na mesma rede local. Em firmware, `localhost` aponta para a própria ESP32, não para o computador. Use o IP LAN ou um nome local acessível da máquina que hospeda o serviço.

Uma sequência segura de configuração é:

1. Configurar credenciais Wi-Fi somente em arquivo local ignorado pelo Git;
2. Descobrir o IP do computador servidor com `ipconfig` no Windows;
3. Confirmar que as duas ESP32 recebem endereços na mesma sub-rede;
4. Testar a conectividade antes de ligar o navegador ao serviço;
5. Configurar CORS somente para as origens necessárias durante o desenvolvimento;
6. Criar regras de firewall mínimas para a porta escolhida;
7. Incluir identificação de dispositivo, autenticação e timeout de reconexão.

## Variáveis de ambiente

Arquivos `.env` reais são ignorados pelo Git. O `.env.example` não contém credenciais porque não há configuração atual.

Valores com prefixo `VITE_` são expostos ao JavaScript do navegador no build. Portanto, nunca use `VITE_` para senha de Wi-Fi, token de ESP32, chave privada ou segredo de servidor. Credenciais de dispositivos devem permanecer no firmware ou no serviço local, fora do código público.

## HTTP, HTTPS e rede local

- Para desenvolvimento na LAN, o servidor precisa escutar em uma interface acessível e o firewall deve permitir a porta escolhida.
- Se o frontend estiver hospedado em HTTPS, chamadas HTTP simples podem ser bloqueadas pelo navegador como conteúdo misto. Planeje HTTPS ou uma arquitetura intermediária apropriada.
- CORS não substitui autenticação: ele é uma política do navegador, não um controle de acesso para dispositivos.
- Um retorno de PWM para o servo confirma apenas a aceitação/execução estimada do comando. Sem fim de curso, não confirma a posição física da cancela.

## Problemas comuns

| Sintoma | Verificação inicial |
| --- | --- |
| ESP32 não alcança o serviço | IP LAN, mesma rede, porta e firewall |
| Navegador bloqueia requisição | Origem CORS, protocolo HTTP/HTTPS e console do navegador |
| Estado não atualiza | Heartbeat, timestamp e reconexão do dispositivo |
| Cancela parece abrir sem movimento real | Alimentação do servo, terra comum, PCA9685 e limite mecânico |

Os detalhes de protocolo e endpoints não foram definidos nesta versão e não devem ser inventados antes dos testes físicos.
