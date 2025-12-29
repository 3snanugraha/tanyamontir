# Enhanced AI Integration - Implementation Plan

## Overview

Upgrade TanyaMontir's AI capabilities with deep thinking, web search, and multi-step reasoning for more accurate automotive diagnosis.

## Strategy: Multi-Layer AI Architecture

### Layer 1: Initial Analysis (Gemini 2.0 Flash)

**Purpose**: Fast initial assessment and question generation

- Current flow for dynamic questions
- Quick symptom categorization
- Generate follow-up questions

### Layer 2: Deep Research (Tavily Search)

**Purpose**: Real-time automotive knowledge retrieval

- Search for specific vehicle issues
- Get latest TSB (Technical Service Bulletins)
- Find common problems for specific make/model/year
- Retrieve repair cost estimates

**Search Queries**:

```
1. "{brand} {model} {year} {category} common problems"
2. "{brand} {model} {year} {specific_symptom} diagnosis"
3. "{brand} {model} {year} {specific_symptom} repair cost"
4. "TSB {brand} {model} {year} {category}"
```

### Layer 3: Deep Thinking (Gemini 2.0 Flash Thinking Experimental)

**Purpose**: Extended reasoning for complex diagnosis

- Analyze all symptoms + answers + research data
- Multi-step reasoning about root causes
- Consider multiple failure scenarios
- Prioritize most likely causes

### Layer 4: Final Response (Gemini 2.0 Flash)

**Purpose**: User-friendly explanation

- Synthesize thinking + research
- Generate clear diagnosis
- Provide actionable recommendations
- Estimate repair costs

## Implementation Details

### 1. Enhanced Chat API Flow

```typescript
// New multi-step flow
async function enhancedDiagnosis(userMessage, sessionData) {
  // Step 1: Tavily Search (if needed)
  const searchResults = await tavilySearch({
    brand: sessionData.brand,
    model: sessionData.model,
    year: sessionData.year,
    category: sessionData.category,
    symptoms: sessionData.symptoms,
  });

  // Step 2: Deep Thinking
  const thinkingResponse = await geminiThinking({
    sessionData,
    searchResults,
    userMessage,
  });

  // Step 3: Final Response
  const finalResponse = await geminiFinal({
    thinkingOutput: thinkingResponse,
    searchResults,
    userMessage,
  });

  return finalResponse;
}
```

### 2. Tavily Integration

**API Endpoint**: `/api/search/automotive`

```typescript
POST /api/search/automotive
{
  "brand": "Honda",
  "model": "Jazz GD3",
  "year": "2006",
  "category": "suspension",
  "symptoms": ["gluduk-gluduk sound", "unstable handling"]
}

Response:
{
  "results": [
    {
      "title": "Common Honda Jazz GD3 Suspension Issues",
      "content": "...",
      "url": "...",
      "score": 0.95
    }
  ]
}
```

### 3. Gemini 2.0 Flash Thinking Integration

**Model**: `gemini-2.0-flash-thinking-exp-01-21`

**Prompt Structure**:

```
You are an expert automotive diagnostic AI. Use extended reasoning to analyze this case.

VEHICLE DATA:
- Brand: {brand}
- Model: {model}
- Year: {year}
- Odometer: {odometer}km
- Transmission: {transmission}

PROBLEM CATEGORY: {category}

SYMPTOMS:
{symptoms}

USER ANSWERS:
{answers}

WEB RESEARCH FINDINGS:
{searchResults}

USER QUESTION:
{userMessage}

INSTRUCTIONS:
1. Think deeply about all possible causes
2. Consider the research findings
3. Analyze symptom patterns
4. Prioritize most likely root causes
5. Consider repair complexity and cost
6. Provide clear, actionable diagnosis

Take your time to reason through this systematically.
```

### 4. Smart Search Triggers

**When to trigger Tavily search**:

- ✅ First message in chat (auto-search)
- ✅ User asks about specific symptoms
- ✅ User asks about repair costs
- ✅ User mentions specific parts
- ❌ General questions (no search needed)

**Search Decision Logic**:

```typescript
function shouldSearch(message: string): boolean {
  const searchKeywords = [
    "biaya",
    "harga",
    "cost",
    "price",
    "gejala",
    "symptom",
    "masalah",
    "problem",
    "penyebab",
    "cause",
    "kenapa",
    "why",
    "TSB",
    "recall",
    "common issue",
  ];

  return searchKeywords.some((keyword) =>
    message.toLowerCase().includes(keyword)
  );
}
```

## UI/UX Enhancements

### 1. Thinking Indicator

Show when AI is in deep thinking mode:

```
🧠 Menganalisa secara mendalam...
🔍 Mencari informasi terkait...
💭 Memproses data diagnosis...
```

### 2. Research Citations

Show sources in response:

```
Berdasarkan riset:
📚 Honda Jazz GD3 Common Issues (AutoGuide 2024)
📚 Suspension Diagnosis Guide (MechanicBase)
```

### 3. Confidence Score

Display AI confidence:

```
Tingkat Keyakinan: ⭐⭐⭐⭐⭐ (95%)
```

## Performance Optimization

### 1. Parallel Processing

```typescript
// Run search and initial analysis in parallel
const [searchResults, initialAnalysis] = await Promise.all([
  tavilySearch(query),
  geminiInitialAnalysis(sessionData),
]);
```

### 2. Caching

- Cache Tavily results for 24 hours
- Cache common vehicle issues
- Reduce API calls

### 3. Streaming

- Stream thinking process to user
- Show progress indicators
- Better perceived performance

## Cost Management

### API Usage Limits

- **Tavily**: 1 search per message (if triggered)
- **Gemini Thinking**: First message only (expensive)
- **Gemini Flash**: All other messages (cheap)

### Credit System Update

- 1 credit = 3 messages (current)
- Deep analysis uses Thinking mode on first message
- Subsequent messages use regular Flash

## Testing Strategy

1. Test with various vehicle scenarios
2. Validate search result relevance
3. Measure thinking quality vs speed
4. A/B test with/without search
5. Monitor API costs

## Rollout Plan

### Phase 1: Tavily Integration

- Add search API route
- Integrate into first message
- Test search quality

### Phase 2: Thinking Mode

- Add Gemini Thinking model
- Use for initial diagnosis only
- Measure improvement

### Phase 3: UI Polish

- Add thinking indicators
- Show research citations
- Display confidence scores

### Phase 4: Optimization

- Implement caching
- Parallel processing
- Cost optimization

## Expected Improvements

- **Accuracy**: +30% (with real automotive data)
- **User Trust**: +40% (with citations)
- **Diagnosis Depth**: +50% (with thinking mode)
- **Response Time**: +2-3s (acceptable tradeoff)
