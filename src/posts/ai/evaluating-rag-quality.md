---
title: "Evaluating RAG Quality: A Pragmatic Approach"
description: "How we built an evaluation pipeline for a production document search agent using synthetic queries, cosine similarities, and LLM-as-a-judge patterns."
date: 2026-05-01
category: "ai"
tags: ["posts", "ai"]
layout: layouts/post.njk
templateEngineOverride: md
---

Deploying a Retrieval-Augmented Generation (RAG) agent to production is easy; making sure it continues to fetch correct source fragments and generates reliable answers without hallucinating across thousands of documents is remarkably hard.

Without an automated evaluation harness, any minor change—like updating system prompts, adjusting chunk sizes, or switching embedding models—is a blind leap of faith. In this note, I'll walk through the practical framework we built to evaluate and monitor RAG quality quantitatively.

## The Core Metrics

To get a clear picture of RAG performance, we measure three distinct dimensions:

1. **Context Relevance**: Did we retrieve fragments that actually contain the answer to the user's query? (Reduces noise).
2. **Faithfulness (Groundedness)**: Is the generated answer derived *only* from the retrieved fragments, or did the LLM hallucinate external information?
3. **Answer Relevance**: Does the generated answer directly address the user's intent?

## Synthesizing Evaluation Datasets

To run automated checks, you need test cases. Instead of manually writing hundreds of question-answer pairs, we use an LLM to generate them synthetically from our document corpus:

```python
import openai
import json

def generate_synthetic_test_case(document_chunk):
    prompt = f"""
    Analyze the document chunk below and generate:
    1. A complex question that can only be answered using information in this chunk.
    2. The exact, factual answer based exclusively on the chunk.

    Document Chunk:
    ---
    {document_chunk}
    ---

    Format the output as JSON:
    {{
      "question": "...",
      "ground_truth": "..."
    }}
    """
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)
```

## Implementing LLM-as-a-Judge

For metrics like **Faithfulness**, a simple exact-match string check fails because natural language has many ways of saying the same thing. Instead, we use a cheap, fast model (like GPT-3.5 or Claude Haiku) as a structured judge:

```python
def evaluate_faithfulness(question, context, answer):
    prompt = f"""
    You are an impartial system evaluator. Determine if the generated answer is fully supported by the context.
    
    Context:
    {context}
    
    Question:
    {question}
    
    Answer to Evaluate:
    {answer}
    
    Output exactly one word: 'YES' if the answer is completely grounded in the context without external assumptions, or 'NO' if it contains unsupported claims.
    """
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0
    )
    return response.choices[0].message.content.strip() == "YES"
```

## Running Evaluations at Scale

By integrating this evaluator into our CI/CD pipeline, we run a daily regression suite over 200 synthetic reference scenarios. When a developer refactors the ingest pipeline or tweaks search weights, the pipeline runs the evaluation and outputs a consolidated score scorecard:

* **Target threshold**: >92% Faithfulness and >88% Context Relevance.
* **Failure action**: Blocks merge requests if scores drop more than 2% below base branches.

This harness has transformed our team's confidence, turning gut-feeling prompt adjustments into empirical engineering steps.
