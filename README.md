<div align="center">

# StoreGPT

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Anthropic](https://img.shields.io/badge/Anthropic-121212?style=for-the-badge)](https://www.anthropic.com/)
[![LangChain](https://img.shields.io/badge/LangChain-000?style=for-the-badge)](https://python.langchain.com/)
[![Gemini](https://img.shields.io/badge/Google%20AI-Gemini-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Azure OpenAI](https://img.shields.io/badge/Azure%20OpenAI-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://learn.microsoft.com/azure/ai-services/openai/)
[![LangGraph](https://img.shields.io/badge/LangGraph-333?style=for-the-badge)](https://langchain-ai.github.io/langgraph/)

An agentic AI assistant for an e-commerce platform that can suggest, add, and remove items from the user's shopping cart, built upon [FastAPI Store Web App](https://github.com/nesteagle/FastAPI-Store-Web-App) (FastAPI/SQLModel + React/Tailwind with Auth0/Stripe). 

</div>

---

## Table of Contents

- [Key Features](#key-features)
- [Project Overview](#project-overview)
- [Technical Overview](#technical-overview)
- [Prompt Practices Overview](#prompt-practices-overview)
- [Project Scope & Impact](#project-scope--impact)
- [Configuration](#configuration)
- [Limitations](#design-choice-limitations)

## Key Features

- **LLM:** OpenAI-compatible models via LangChain (currently configured for Gemini 2.5 Flash for speed + cost, easily swappable)
- **Pipeline:** LangGraph pipeline with three main steps: analyze, retrieve, generate
- **Retrieval (RAG):** Full RAG workflow using Vector search over product documents to provide relevant context
- **Agentic Workflow:** Tool calling in LangGraph state and functions the agent calls to recommend items and edit your cart
- **Memory:** Conversation history with smart filtering to stay token-efficient and within context limits
- **Best Prompting Practices:** Adheres to OpenAI prompt guidelines and best current prompt engineering practices.
## Project Overview

This was a summer project between first and second year at UBC Computer Science. This was an AI-centric expansion built on my previous full-stack project, made all in August. In this, I reworked FastAPI Store to revolve around a ChatGPT-esque interface as a conceptual store design.

## Technical Overview

### Technical Implementation

**Vector Search + RAG:**
- Product catalog is embedded and indexed with metadata (IDs, names, descriptions)
- Query-time semantic search retrieves relevant product snippets
- Queried results are used to ground the model

**Available Tools:**
- `recommend_similar_items`: Suggests products and optionally adds them to cart
- `add_item_to_cart`: Adds specific products using exact IDs/names
- `remove_items_from_cart`: Removes products from cart
(more can be added easily in tools.py)

**State Management:**
- Typed state carries: question, conversation history, search query, retrieved context, cart, tool calls, and final answer
- Context window management: keeps exactly MAX_CONTEXT_MESSAGES recent turns for clarity and efficiency

**Observability/Transparency:**
- Optional LangSmith integration for tracing prompts, runs, and latencies
- Adjustable parameters: context window size, retrieval count, prompt content

**Model Flexibility:**
- Supports any OpenAI‑compatible models (e.g., OpenAI, Azure OpenAI, hosted Ollama, most major LLM providers)
- Currently using Gemini 2.5 Flash for cost‑effectiveness, and can be changed to preference

### How it works

**Request Flow:**
1. **Analyze:** Parse your question into a structured search query
2. **Retrieve:** Find relevant products using vector similarity search on embedded products
3. **Generate:**
   - Compose a working prompt with: system rules + cart state + examples + product context + recent conversation
   - If actions are needed: call tools first, then provide a brief confirmation
   - Otherwise: answer directly using the retrieved information

**What gets remembered:**
- Your actual conversation (questions and responses)
- What gets filtered out: system messages, cart snapshots, examples, and product context

(It's optimized to balance accuracy and token efficiency - complex request processes take around ~1200 tokens.)



## Prompt Practices Overview
Features are defined in the system prompt which follows OpenAI and modern prompt engineering best practices. Also uses few-shot prompting for further accuracy boost.

**Preset Conversation Style:**
- Uses fallback responses for edge cases:
  - Unknown information → "I don't know."
  - Too many recommendations → "Sorry, I can't recommend that many items."
  - Invalid products → "Sorry, something went wrong with your request."

**Smart Behavior:**
- Asks for clarification instead of guessing when product references are ambiguous
- Acknowledges repeated actions ("Added Product X again as requested")
- Sequences multi-step requests logically (e.g., recommend first, then add to cart)

**Safety Features:**
- Only uses current product information, never invents products
- Exact ID and name matching prevents accidental cart modifications
- Refuses requests outside its scope with polite explanations

## Project Scope & Impact

Aside from the technical details and timeframe, this project is meant to provide a conceptual statement for a future AI-centric store. With expansions to the agent and updates for future best AI practices, this could be an interesting and unique path for future e-commerce!

It also adheres to transparent and safe development practices: developed using LangSmith with agent calls analyzed + monitored during development.

## Configuration

Any OpenAI‑compatible model may be used via LangChain configuration. All models work with the same tool‑calling interface and prompting practices (since LangChain handles tool schemas).

**Model options**
- OPENAI_API_KEY: OpenAI GPT models and OpenAI‑compatible endpoints
- GOOGLE_API_KEY: Gemini models (current default)
- ANTHROPIC_API_KEY: Claude models (if enabled separately)
- LANGSMITH_API_KEY: tracing for responsible development

Model switching: you only need to change the LangChain chat model initialization and keys (no other changes required!)

## Screenshots
- **Home Page** - Chat with the assistant here.
<div align="center">
  <img src="screenshots/homepage.png" alt="Home page." width="800"/>
</div>
<p align="center"><em>Home page.</em></p>
<div align="center">
  <img src="screenshots/add_items.png" alt="Confirmation screen for agent calls." width="800"/>
</div>
<p align="center"><em>Confirmation screen for agent calls (No images, example items).</em></p>
<div align="center">
  <img src="screenshots/malicious_chat.png" alt="Prompt injection and sensitive info prevention." width="800"/>
</div>
<p align="center"><em>Prompt injection and sensitive info prevention.</em></p>

## Design Choice Limitations
- Strict product matching prevents ambiguous cart edits
- Conservative, token‑efficient approach to unknowns (prefers "I don't know" over guessing)
- Simple retrieval strategy that can be optimized for larger catalogs
- Uses InMemoryVectorStore due to intended containerized "session" nature of the application.
---

<div align="center">

*⭐ If you liked this project, give it a star!*

</div>