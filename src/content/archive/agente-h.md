---
date: "2026-05"
title: Agente H — WhatsApp sales agent
role: built alone
tags: [code, ai]
links:
  repo: https://github.com/Arthur-Heberle/AGENT-H
blurb: >-
  A WhatsApp agent that answers customers from a store's own catalogue and hands the
  owner the ones ready to buy.
wip: true
project:
  solo: true
  what: >-
    A WhatsApp sales agent for small Brazilian businesses. It answers customers from the store's
    own catalogue, during the hours the owner sets, and hands the owner the conversations that
    are ready to buy.
  status: >-
    In progress. Working today: the dashboard, the lead qualification, the catalogue search and
    the WhatsApp replies. Next: running it for a real store.
  built:
    - >-
      One Postgres does everything: conversations, catalogue and search. pgvector keeps a
      1,536-number description of every product next to the product itself, so there is no
      separate search service to run or pay for.
    - >-
      n8n catches each WhatsApp message through Evolution API and handles the waiting. A FastAPI
      service does the thinking: it finds the products, calls the model and classifies the
      conversation.
    - >-
      A product is re-described only when its name, category, description or specs change.
      Changing a price never touches the search.
    - >-
      Every business sees only its own data. The account is keyed to the business's phone number,
      and every query filters by it.
    - >-
      It answers private one-to-one chats only, never groups.
    - >-
      The model is swappable: any OpenAI-compatible provider works. Today it runs on DeepSeek.
  next:
    - >-
      The CSV import is the shakiest part. You can upload any catalogue and an AI works out which
      column is the price and which is the stock, but it still gets some values wrong.
    - >-
      Product photos are saved on the server's disk, which Railway wipes on every redeploy. They
      need to move to real storage.
---
