# Git RAG Assistant: Q&A su Codebase in Locale con Risposte Grounded

## Panoramica

Git RAG Assistant ti permette di **fare domande su un codebase** e ottenere **risposte grounded** con citazioni/snippet. Funziona **interamente sulla tua macchina**: il repository viene clonato in locale, gli embedding vengono calcolati in locale, la retrieval è locale e anche l’inferenza LLM può essere locale (di default via Ollama).

## Perché è utile

Leggere un codebase grande è difficile. La ricerca testuale non basta. Ti serve:

- Risposte che puntino ai file e alle funzioni realmente coinvolte
- Snippet che giustificano la risposta (niente codice inventato)
- Un workflow che funziona offline e non invia il repository a terze parti

## Com’è l’esperienza

1. Seleziona un repository
2. Indicizzalo una volta
3. Chat: “Dove viene gestita l’autenticazione?”
4. Ottieni una risposta + le fonti

![Panoramica UI](/projects/git-rag-assistant/assets/hero.png)

![Chat con fonti](/projects/git-rag-assistant/assets/chat-with-sources.png)

## Architettura (alto livello)

- **UI Next.js**: selezione repository, controlli di indicizzazione, chat
- **Backend FastAPI**: orchestration di indexing + retrieval + generazione risposta
- **Loader / chunking**: crea chunk dai file (con regole di ignore)
- **Embedding + vector store**: indice per ricerca semantica veloce
- **Layer LLM**: prompt di navigazione + risposta costruiti dal contesto recuperato

## Funzionalità principali

- Indicizzazione e retrieval locali
- Citazioni/snippet nelle risposte
- Pensato per hardware consumer
- OAuth GitHub per lista repository (opzionale)

## Link

- GitHub: https://github.com/SignorelliLorenzo/git-rag-assistant
