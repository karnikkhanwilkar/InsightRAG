# Gemini Prompt Template

This document contains the exact prompt template used by the RAG system when generating answers.

## Full Prompt Structure

```
You are a helpful AI assistant that answers questions based ONLY on the provided context.

INSTRUCTIONS:
1. Answer the question using ONLY the information from the context below
2. Cite sources inline using [1], [2], [3], etc., where the numbers correspond to the source numbers in the context
3. If the context doesn't contain relevant information to answer the question, respond with: "I couldn't find relevant information in the provided documents."
4. Do NOT make up information or use knowledge outside the provided context
5. Be concise and direct in your answer
6. Use multiple citations when information comes from different sources

CONTEXT:
{context}

QUESTION: {query}

ANSWER:
```

## Context Format

The context is formatted as numbered sources:

```
[1] Source: document.pdf | Section: Introduction
Content of the first retrieved chunk goes here. This is the actual text from the document that was deemed relevant by the retrieval and reranking process.

[2] Source: research_paper.pdf | Section: Methodology
Content of the second chunk. Each chunk is prefixed with its reference number, source filename, and section (if available).

[3] Source: notes.txt | Section: 
Third chunk content. Even if no section is detected, the format is maintained for consistency.

[4] Source: document.pdf | Section: Conclusion
Fourth chunk. Multiple chunks from the same source are perfectly fine and common.
```

## Example Full Prompt

### Example 1: Technical Question

**Input:**
- Query: "What is machine learning?"
- Retrieved chunks: 4 chunks from ML textbook

**Generated Prompt:**
```
You are a helpful AI assistant that answers questions based ONLY on the provided context.

INSTRUCTIONS:
1. Answer the question using ONLY the information from the context below
2. Cite sources inline using [1], [2], [3], etc., where the numbers correspond to the source numbers in the context
3. If the context doesn't contain relevant information to answer the question, respond with: "I couldn't find relevant information in the provided documents."
4. Do NOT make up information or use knowledge outside the provided context
5. Be concise and direct in your answer
6. Use multiple citations when information comes from different sources

CONTEXT:
[1] Source: ml_textbook.pdf | Section: Chapter 1 - Introduction
Machine learning is a subset of artificial intelligence that focuses on the development of algorithms and statistical models that enable computer systems to improve their performance on a specific task through experience.

[2] Source: ml_textbook.pdf | Section: Chapter 1 - Types of Learning
There are three main types of machine learning: supervised learning, where the algorithm learns from labeled data; unsupervised learning, which finds patterns in unlabeled data; and reinforcement learning, where an agent learns through trial and error.

[3] Source: ml_basics.txt | Section: 
ML algorithms can identify patterns in data without being explicitly programmed. They use statistical techniques to enable computers to learn and adapt based on data inputs.

[4] Source: ml_textbook.pdf | Section: Chapter 2 - Applications
Machine learning is widely used in various applications including image recognition, natural language processing, recommendation systems, and predictive analytics.

QUESTION: What is machine learning?

ANSWER:
```

**Expected Output:**
```
Machine learning is a subset of artificial intelligence that focuses on developing algorithms and statistical models that enable computer systems to improve their performance through experience [1]. These algorithms can identify patterns in data without being explicitly programmed [3]. There are three main types: supervised learning (learning from labeled data), unsupervised learning (finding patterns in unlabeled data), and reinforcement learning (learning through trial and error) [2].
```

### Example 2: Multi-Source Question

**Input:**
- Query: "What are the applications of AI in healthcare?"
- Retrieved chunks: 3 chunks from different sources

**Generated Prompt:**
```
You are a helpful AI assistant that answers questions based ONLY on the provided context.

INSTRUCTIONS:
1. Answer the question using ONLY the information from the context below
2. Cite sources inline using [1], [2], [3], etc., where the numbers correspond to the source numbers in the context
3. If the context doesn't contain relevant information to answer the question, respond with: "I couldn't find relevant information in the provided documents."
4. Do NOT make up information or use knowledge outside the provided context
5. Be concise and direct in your answer
6. Use multiple citations when information comes from different sources

CONTEXT:
[1] Source: healthcare_ai.pdf | Section: Medical Imaging
AI systems are revolutionizing medical imaging by assisting radiologists in detecting diseases such as cancer, pneumonia, and fractures with high accuracy. Deep learning models can analyze X-rays, MRIs, and CT scans faster than human experts.

[2] Source: ai_applications.txt | Section: 
In drug discovery, AI can analyze molecular structures and predict which compounds are most likely to be effective treatments. This significantly reduces the time and cost of bringing new drugs to market.

[3] Source: digital_health.pdf | Section: Diagnostics
AI-powered diagnostic tools can analyze patient symptoms, medical history, and test results to suggest possible diagnoses and treatment options. These systems serve as decision support tools for physicians.

QUESTION: What are the applications of AI in healthcare?

ANSWER:
```

**Expected Output:**
```
AI has several important applications in healthcare. In medical imaging, AI systems assist radiologists in detecting diseases like cancer, pneumonia, and fractures by analyzing X-rays, MRIs, and CT scans with high accuracy [1]. AI is also used in drug discovery to analyze molecular structures and predict effective treatments, reducing development time and costs [2]. Additionally, AI-powered diagnostic tools analyze patient symptoms, medical history, and test results to suggest possible diagnoses and treatment options, serving as decision support for physicians [3].
```

### Example 3: No Relevant Information

**Input:**
- Query: "What is quantum computing?"
- Retrieved chunks: About machine learning (not relevant)

**Generated Prompt:**
```
You are a helpful AI assistant that answers questions based ONLY on the provided context.

INSTRUCTIONS:
1. Answer the question using ONLY the information from the context below
2. Cite sources inline using [1], [2], [3], etc., where the numbers correspond to the source numbers in the context
3. If the context doesn't contain relevant information to answer the question, respond with: "I couldn't find relevant information in the provided documents."
4. Do NOT make up information or use knowledge outside the provided context
5. Be concise and direct in your answer
6. Use multiple citations when information comes from different sources

CONTEXT:
[1] Source: ml_basics.txt | Section: 
Machine learning is a subset of artificial intelligence that enables computers to learn from data without explicit programming.

[2] Source: neural_networks.pdf | Section: Deep Learning
Deep neural networks consist of multiple layers that progressively extract higher-level features from input data.

[3] Source: ai_history.txt | Section: 
The field of artificial intelligence began in the 1950s with researchers exploring how to make machines that could think.

[4] Source: ml_applications.pdf | Section: 
Today, machine learning is used in recommendation systems, fraud detection, and autonomous vehicles.

QUESTION: What is quantum computing?

ANSWER:
```

**Expected Output:**
```
I couldn't find relevant information in the provided documents.
```

## Prompt Engineering Best Practices

The prompt is designed with these principles:

1. **Strict Grounding**: Forces the model to use only provided context
2. **Citation Requirements**: Mandates inline citations for transparency
3. **Failure Mode**: Provides clear instruction for cases with no relevant info
4. **Brevity**: Encourages concise, direct answers
5. **Multi-Source Support**: Allows combining information from multiple chunks

## Citation Format

Citations are inline brackets:
- `[1]` refers to first context chunk
- `[2]` refers to second context chunk
- Multiple citations: `[1][2]` or `[1], [2]`

The model learns to place citations immediately after the information from that source.

## Customization Options

You can modify the prompt in `backend/llm.py` by editing the `_create_prompt` method:

### Make answers more detailed:
Change: "Be concise and direct in your answer"
To: "Provide detailed and comprehensive answers"

### Add specific formatting:
Add: "7. Format your answer with bullet points when listing multiple items"

### Adjust citation style:
Change: "Cite sources inline using [1], [2], [3]"
To: "Cite sources using (Source 1), (Source 2) format"

### Add comparison instructions:
Add: "8. When information from sources conflicts, mention both perspectives with their respective citations"

## Model Configuration

Currently using: **Gemini 1.5 Flash**

Alternative models you can use:
- `gemini-1.5-pro`: More capable but slower and costlier
- `gemini-pro`: Earlier version (1.0)

To change model, edit `backend/config.py`:
```python
llm_model: str = "gemini-1.5-pro"  # or "gemini-pro"
```

## Token Limits

Gemini 1.5 Flash limits:
- Input: ~1 million tokens (context + prompt)
- Output: ~8,192 tokens

The system typically uses:
- Context: 2,000-4,000 tokens (4 chunks × ~500-1000 tokens each)
- Prompt template: ~200 tokens
- Output: 100-500 tokens

Total: ~2,500-5,000 tokens per query

## Testing the Prompt

To test prompt modifications:

1. Edit `backend/llm.py` → `_create_prompt` method
2. Restart backend: `python main.py`
3. Test with known queries
4. Compare answer quality and citation accuracy

## Implementation Location

The prompt is implemented in:
- **File**: `backend/llm.py`
- **Class**: `LLMAnswerer`
- **Method**: `_create_prompt(self, query: str, context: str) -> str`

## Related Components

- Context building: `_build_context` method in `llm.py`
- Citation extraction: `_extract_citations` method in `llm.py`
- Token counting: Uses `tiktoken` library with `cl100k_base` encoding
