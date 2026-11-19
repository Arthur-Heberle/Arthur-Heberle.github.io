---
date: "2026-05"
title: Agente H — agente de vendas no WhatsApp
role: feito sozinho
tags: [code, ai]
links:
  repo: https://github.com/Arthur-Heberle/AGENT-H
status: em andamento
link: /projects/agente-h/
line: >-
  Um agente de WhatsApp que responde os clientes a partir do catálogo da própria loja e entrega
  ao dono os que estão prontos para comprar.
project:
  solo: true
  what: >-
    Um agente de vendas no WhatsApp para pequenos negócios brasileiros. Ele responde os clientes
    a partir do catálogo da própria loja, nos horários que o dono define, e entrega ao dono as
    conversas que estão prontas para comprar.
  status: >-
    Em andamento. Funcionando hoje: o painel, a qualificação de leads, a busca no catálogo e as
    respostas no WhatsApp. Próximo: rodar com uma loja de verdade.
  built:
    - >-
      Um único Postgres faz tudo: conversas, catálogo e busca. O pgvector guarda uma descrição de
      1.536 números de cada produto junto do próprio produto, então não existe um serviço de busca
      separado para manter nem pagar.
    - >-
      O n8n recebe cada mensagem do WhatsApp pela Evolution API e cuida da espera. Um serviço
      FastAPI faz o raciocínio: encontra os produtos, chama o modelo e classifica a conversa.
    - >-
      Um produto só é descrito de novo quando mudam o nome, a categoria, a descrição ou as
      especificações. Mudar o preço nunca mexe na busca.
    - >-
      Cada negócio vê apenas os próprios dados. A conta é ligada ao número de telefone do negócio,
      e toda consulta filtra por ele.
    - >-
      Ele responde apenas conversas privadas, individuais, nunca grupos.
    - >-
      O modelo é intercambiável: qualquer provedor compatível com a OpenAI funciona. Hoje roda no
      DeepSeek.
  next:
    - >-
      A importação de CSV é a parte mais frágil. Dá para enviar qualquer catálogo e uma IA descobre
      qual coluna é o preço e qual é o estoque, mas ainda erra alguns valores.
    - >-
      As fotos dos produtos são salvas no disco do servidor, que o Railway apaga a cada novo
      deploy. Elas precisam ir para um armazenamento de verdade.
---
