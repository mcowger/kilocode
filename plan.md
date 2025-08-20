# Plan: Exclude Temperature from Codex API Parameters

## Problem Analysis
When `CodexHandler` sets up the `OpenAiNativeHandler` and calls `createMessage`, the "temperature" parameter is being included in the API call parameters. For Codex models, this parameter should not be included.

## Current Flow
1. **In `codex.ts`** (lines 144-147): The `CodexHandler` creates an `OpenAiNativeHandler` by spreading `this.options` which includes the `modelTemperature` property:
```typescript
this.client = new OpenAiNativeHandler({
    ...this.options,
    openAiNativeApiKey: this.credentials!.tokens.access_token,
}, CODEX_RESPONSES_BASEURL)
```

2. **In `openai-native.ts`** (line 298): The `handleResponsesApiMessage` method includes temperature in the request body:
```typescript
temperature: this.options.modelTemperature ?? GPT5_DEFAULT_TEMPERATURE,
```

## Solution Approaches
There are two possible approaches to fix this:

### Approach 1: Modify CodexHandler (Recommended)
Create a copy of the options without the `modelTemperature` property when setting up the `OpenAiNativeHandler` in `codex.ts`.

**Implementation:**
```typescript
// Create a copy of options without modelTemperature
const { modelTemperature, ...optionsWithoutTemperature } = this.options
this.client = new OpenAiNativeHandler({
    ...optionsWithoutTemperature,
    openAiNativeApiKey: this.credentials!.tokens.access_token,
}, CODEX_RESPONSES_BASEURL)
```

### Approach 2: Modify OpenAiNativeHandler
Add logic in `openai-native.ts` to exclude temperature for Codex models specifically.

**Implementation:**
```typescript
// Only include temperature if not a Codex model
temperature: this.isResponsesApiModel(model.id) && model.id.startsWith("codex-") 
    ? undefined 
    : this.options.modelTemperature ?? GPT5_DEFAULT_TEMPERATURE,
```

## Recommended Solution
**Approach 1** is recommended because:
1. It's more explicit about the intent to exclude temperature for Codex
2. It keeps the logic in the CodexHandler where the decision is made
3. It doesn't add special-case logic to the more generic OpenAiNativeHandler

## Implementation Steps
1. Modify the `ensureAuthenticated` method in `codex.ts` to exclude `modelTemperature` from the options passed to `OpenAiNativeHandler`
2. Test that the temperature parameter is no longer included in the API calls

## Files to Modify
- `src/api/providers/codex.ts`: Lines 144-147 in the `ensureAuthenticated` method