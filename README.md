# commit-message-quality

An [ObjectiveAI](https://objective-ai.io) function that scores how well a commit message follows best practices.

## Usage

```typescript
import { ObjectiveAI, Functions } from "objectiveai";

const client = new ObjectiveAI();

const result = await Functions.Executions.remoteFunctionRemoteProfileCreate(client, {
  function: {
    owner: "ObjectiveAI-claude-code-1",
    repository: "commit-message-quality",
  },
  profile: {
    owner: "ObjectiveAI-claude-code-1",
    repository: "commit-message-quality",
  },
  input: {
    message: "Add user authentication via OAuth2 to prevent unauthorized API access"
  }
});

console.log(result.output); // 0.0 - 1.0
```

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | The commit message to evaluate |
| `diff` | string | No | The actual code diff for accuracy checking |
| `context` | string | No | Additional context about the change |

### Examples

```typescript
// Message only
{ message: "Fix null pointer exception in PaymentService by adding guard clause" }

// With diff for accuracy checking
{
  message: "Fix race condition in session cleanup by adding mutex lock",
  diff: "- sessions.delete(id)\n+ mutex.Lock()\n+ defer mutex.Unlock()\n+ sessions.delete(id)"
}

// With context
{
  message: "Update login form validation",
  context: "Adding email format validation to the login form"
}
```

## Output

Returns a scalar score in the range `[0, 1]`:

| Score | Rating | Description |
|-------|--------|-------------|
| 1.0 | Excellent | Clear, concise, imperative mood, explains "why", accurately describes changes |
| 0.67 | Good | Solid message with minor issues (slightly long, could explain "why" more) |
| 0.33 | Acceptable | Gets the job done but could be improved (vague terms, missing context, wrong tense) |
| 0.0 | Poor | Vague, unclear, misleading, badly formatted, or inaccurate |

The output is computed as: `scores[0] + scores[1]*0.67 + scores[2]*0.33`

## Evaluation Criteria

- **Imperative mood** - "Add" not "Added", "Fix" not "Fixed"
- **Subject line length** - Ideally ≤72 characters
- **Specificity** - Not vague like "fix", "update", "wip", "asdfasdf"
- **Explains the "why"** - Not just what changed, but why it matters
- **Accuracy** - If diff/context provided, message should match the actual changes

## Ensemble

Uses 5 LLMs with equal weights:
- `openai/gpt-4.1-nano`
- `google/gemini-2.5-flash-lite`
- `x-ai/grok-4.1-fast`
- `openai/gpt-4o-mini`
- `deepseek/deepseek-v3.2`

## Development

```bash
npm install           # Install dependencies
npm run build         # Build and run all tests
npm run test          # Run validation tests only
```

## License

MIT
