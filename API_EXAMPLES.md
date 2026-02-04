# API Examples & Testing

This document provides comprehensive examples for testing the RAG API.

## Table of Contents
- [Setup](#setup)
- [Ingest Examples](#ingest-examples)
- [Query Examples](#query-examples)
- [Complete Workflow](#complete-workflow)
- [Error Handling](#error-handling)

## Setup

### Using cURL

All examples use cURL. Replace `http://localhost:8000` with your deployed backend URL.

### Using Python Requests

```python
import requests

BASE_URL = "http://localhost:8000"

def ingest_text(text, source_name="pasted_text"):
    response = requests.post(
        f"{BASE_URL}/ingest",
        data={"text": text, "source_name": source_name}
    )
    return response.json()

def ingest_file(file_path):
    with open(file_path, "rb") as f:
        response = requests.post(
            f"{BASE_URL}/ingest",
            files={"file": f}
        )
    return response.json()

def query(question):
    response = requests.post(
        f"{BASE_URL}/query",
        json={"question": question}
    )
    return response.json()
```

## Ingest Examples

### Example 1: Ingest Plain Text

```bash
curl -X POST http://localhost:8000/ingest \
  -F "text=Machine learning is a subset of artificial intelligence that focuses on the development of algorithms and statistical models. Deep learning uses neural networks with multiple layers to process data. These models can identify patterns and make decisions with minimal human intervention." \
  -F "source_name=ml_basics"
```

**Response:**
```json
{
  "message": "Content ingested successfully",
  "source": "ml_basics",
  "chunks_created": 1,
  "latency_ms": 1234
}
```

### Example 2: Ingest PDF File

```bash
curl -X POST http://localhost:8000/ingest \
  -F "file=@research_paper.pdf"
```

**Response:**
```json
{
  "message": "Content ingested successfully",
  "source": "research_paper.pdf",
  "chunks_created": 24,
  "latency_ms": 3456
}
```

### Example 3: Ingest Text File

```bash
curl -X POST http://localhost:8000/ingest \
  -F "file=@notes.txt"
```

### Example 4: Ingest Large Document

```bash
# Create a test document
cat > long_document.txt << 'EOF'
# Introduction to Artificial Intelligence

Artificial Intelligence (AI) has revolutionized modern technology. AI systems can perform tasks that typically require human intelligence, including visual perception, speech recognition, decision-making, and language translation.

# Machine Learning

Machine learning is a core component of AI. It enables systems to automatically learn and improve from experience without being explicitly programmed. There are three main types:

1. Supervised Learning: Learning from labeled data
2. Unsupervised Learning: Finding patterns in unlabeled data
3. Reinforcement Learning: Learning through trial and error

# Deep Learning

Deep learning is a subset of machine learning based on artificial neural networks. It uses multiple layers to progressively extract higher-level features from raw input. Applications include:

- Image recognition
- Natural language processing
- Speech recognition
- Autonomous vehicles

# Applications

AI applications are everywhere:
- Healthcare: Disease diagnosis and drug discovery
- Finance: Fraud detection and algorithmic trading
- Retail: Recommendation systems
- Manufacturing: Quality control and predictive maintenance
EOF

# Ingest it
curl -X POST http://localhost:8000/ingest \
  -F "file=@long_document.txt"
```

## Query Examples

### Example 1: Simple Question

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is machine learning?"
  }'
```

**Response:**
```json
{
  "answer": "Machine learning is a subset of artificial intelligence that focuses on the development of algorithms and statistical models [1]. It enables systems to automatically learn and improve from experience without being explicitly programmed [2].",
  "citations": [
    {
      "number": 1,
      "source": "ml_basics",
      "section": "",
      "content": "Machine learning is a subset of artificial intelligence that focuses on the development of algorithms and statistical models. Deep learning uses neural networks..."
    },
    {
      "number": 2,
      "source": "long_document.txt",
      "section": "Machine Learning",
      "content": "Machine learning is a core component of AI. It enables systems to automatically learn and improve from experience without being explicitly programmed..."
    }
  ],
  "latency_ms": 1523,
  "input_tokens": 456,
  "output_tokens": 89
}
```

### Example 2: Complex Question

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How does deep learning differ from traditional machine learning?"
  }'
```

### Example 3: Question Requiring Multiple Sources

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the applications of AI in healthcare and finance?"
  }'
```

### Example 4: Question with No Answer

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is quantum computing?"
  }'
```

**Response:**
```json
{
  "answer": "I couldn't find relevant information in the provided documents.",
  "citations": [],
  "latency_ms": 234,
  "input_tokens": 0,
  "output_tokens": 0
}
```

## Complete Workflow

### Scenario: Building a Company Knowledge Base

```bash
#!/bin/bash

BASE_URL="http://localhost:8000"

echo "=== Step 1: Ingest Company Policies ==="
curl -X POST $BASE_URL/ingest \
  -F "text=Our company offers 20 days of paid vacation per year. Employees can request vacation through the HR portal. Sick leave is separate and unlimited." \
  -F "source_name=hr_policies"

echo -e "\n\n=== Step 2: Ingest Product Documentation ==="
curl -X POST $BASE_URL/ingest \
  -F "text=Our flagship product is CloudSync Pro. It offers real-time data synchronization across devices. Pricing starts at $9.99/month for individuals and $49.99/month for teams." \
  -F "source_name=product_docs"

echo -e "\n\n=== Step 3: Ingest Technical Guide ==="
curl -X POST $BASE_URL/ingest \
  -F "text=CloudSync Pro uses AES-256 encryption for data security. API rate limits are 1000 requests per hour. WebSocket connections are maintained for real-time updates." \
  -F "source_name=technical_guide"

echo -e "\n\n=== Step 4: Query HR Policy ==="
curl -X POST $BASE_URL/query \
  -H "Content-Type: application/json" \
  -d '{"question": "How many vacation days do employees get?"}'

echo -e "\n\n=== Step 5: Query Product Info ==="
curl -X POST $BASE_URL/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the pricing for CloudSync Pro?"}'

echo -e "\n\n=== Step 6: Query Technical Details ==="
curl -X POST $BASE_URL/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What encryption does CloudSync Pro use?"}'

echo -e "\n\n=== Step 7: List All Sources ==="
curl -X GET $BASE_URL/sources
```

## Using Postman

### Import Collection

Create a Postman collection with these requests:

**1. Ingest Text**
- Method: POST
- URL: `{{baseUrl}}/ingest`
- Body: form-data
  - `text`: "Your content here"
  - `source_name`: "test_doc"

**2. Ingest File**
- Method: POST
- URL: `{{baseUrl}}/ingest`
- Body: form-data
  - `file`: [Select file]

**3. Query**
- Method: POST
- URL: `{{baseUrl}}/query`
- Body: raw (JSON)
```json
{
  "question": "What is the main topic?"
}
```

**4. Get Sources**
- Method: GET
- URL: `{{baseUrl}}/sources`

Environment variable:
- `baseUrl`: `http://localhost:8000`

## Error Handling

### Error Response Format

```json
{
  "detail": "Error message here"
}
```

### Common Errors

**400 Bad Request - Empty Content**
```bash
curl -X POST http://localhost:8000/ingest \
  -F "text=" \
  -F "source_name=empty"
```

Response:
```json
{
  "detail": "Content is too short or empty"
}
```

**400 Bad Request - No Input**
```bash
curl -X POST http://localhost:8000/ingest
```

Response:
```json
{
  "detail": "Either text or file must be provided"
}
```

**400 Bad Request - Short Question**
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Hi"}'
```

Response:
```json
{
  "detail": "Question is too short"
}
```

**400 Bad Request - Unsupported File**
```bash
curl -X POST http://localhost:8000/ingest \
  -F "file=@document.docx"
```

Response:
```json
{
  "detail": "Unsupported file type. Only PDF and TXT files are supported."
}
```

## Performance Testing

### Test Latency

```bash
# Ingest and measure time
time curl -X POST http://localhost:8000/ingest \
  -F "file=@large_document.pdf"

# Query and measure time
time curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the main conclusion?"}'
```

### Load Testing with Apache Bench

```bash
# Install Apache Bench (if needed)
# sudo apt-get install apache2-utils

# Test query endpoint
ab -n 100 -c 10 -p query.json -T application/json \
  http://localhost:8000/query

# query.json contains:
# {"question": "What is machine learning?"}
```

## Python Test Script

```python
#!/usr/bin/env python3
"""
Complete test script for RAG API
"""
import requests
import time
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test API health"""
    print("Testing API health...")
    response = requests.get(f"{BASE_URL}/")
    assert response.status_code == 200
    print("✓ API is healthy")
    return response.json()

def test_ingest_text():
    """Test text ingestion"""
    print("\nTesting text ingestion...")
    data = {
        "text": "Python is a high-level programming language. It is widely used for web development, data science, and automation.",
        "source_name": "python_intro"
    }
    response = requests.post(f"{BASE_URL}/ingest", data=data)
    assert response.status_code == 200
    result = response.json()
    print(f"✓ Ingested {result['chunks_created']} chunks in {result['latency_ms']}ms")
    return result

def test_ingest_file(filepath):
    """Test file ingestion"""
    print(f"\nTesting file ingestion: {filepath}...")
    with open(filepath, "rb") as f:
        response = requests.post(
            f"{BASE_URL}/ingest",
            files={"file": f}
        )
    assert response.status_code == 200
    result = response.json()
    print(f"✓ Ingested {result['chunks_created']} chunks in {result['latency_ms']}ms")
    return result

def test_query(question):
    """Test query"""
    print(f"\nTesting query: {question}")
    response = requests.post(
        f"{BASE_URL}/query",
        json={"question": question}
    )
    assert response.status_code == 200
    result = response.json()
    print(f"Answer: {result['answer']}")
    print(f"Citations: {len(result['citations'])}")
    print(f"Latency: {result['latency_ms']}ms")
    return result

def test_sources():
    """Test get sources"""
    print("\nTesting get sources...")
    response = requests.get(f"{BASE_URL}/sources")
    assert response.status_code == 200
    result = response.json()
    print(f"✓ Found {result['count']} sources: {result['sources']}")
    return result

def main():
    print("=" * 60)
    print("RAG API Test Suite")
    print("=" * 60)
    
    try:
        # Test health
        test_health()
        
        # Test ingestion
        test_ingest_text()
        
        # Test queries
        test_query("What is Python?")
        test_query("What is Python used for?")
        
        # Test sources
        test_sources()
        
        print("\n" + "=" * 60)
        print("All tests passed! ✓")
        print("=" * 60)
        
    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
    except Exception as e:
        print(f"\n✗ Error: {e}")

if __name__ == "__main__":
    main()
```

Save as `test_api.py` and run:
```bash
python test_api.py
```

## Integration with Other Tools

### cURL to Python

```python
import subprocess
import json

result = subprocess.run([
    'curl', '-X', 'POST', 'http://localhost:8000/query',
    '-H', 'Content-Type: application/json',
    '-d', '{"question": "What is AI?"}'
], capture_output=True, text=True)

response = json.loads(result.stdout)
print(response['answer'])
```

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function query(question) {
  const response = await axios.post('http://localhost:8000/query', {
    question: question
  });
  return response.data;
}

async function main() {
  const result = await query('What is machine learning?');
  console.log('Answer:', result.answer);
  console.log('Citations:', result.citations.length);
}

main();
```

This completes the API examples documentation!
