# commit-message-quality

A scalar ObjectiveAI function that scores how well a commit message follows best practices.

## Input Schema

- `message` (string, required): The commit message to evaluate
- `diff` (string, optional): The actual code diff for accuracy checking
- `context` (string, optional): Additional context about the change

## Scoring

4-tier vector completion task:
1. **Excellent** (weight: 1.0) - Clear, concise, imperative mood, explains "why", matches diff/context
2. **Good** (weight: 0.67) - Solid message with minor issues
3. **Acceptable** (weight: 0.33) - Gets the job done but could be improved
4. **Poor** (weight: 0.0) - Vague, unclear, misleading, or badly formatted

Output formula: `scores[0] + scores[1]*0.67 + scores[2]*0.33`

## Evaluation Criteria

- Uses imperative mood ("Add" not "Added")
- Subject line ideally ≤72 characters
- Specific and descriptive (not "fix", "update", "wip")
- Explains the "why" not just the "what"
- If diff provided: message accurately describes the changes
- If context provided: message aligns with stated intent

## Ensemble

Uses 5 LLMs with equal weights:
- openai/gpt-4.1-nano
- google/gemini-2.5-flash-lite
- x-ai/grok-4.1-fast
- openai/gpt-4o-mini
- deepseek/deepseek-v3.2

## Development

```bash
npm install      # Install dependencies
npm run build    # Build and run all tests
npm run test     # Run validation tests only
```