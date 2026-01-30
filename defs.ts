import { Functions } from "objectiveai";
import { ExampleInput } from "./example_input";

export const Function: Functions.RemoteFunction = {
  type: "scalar.function",
  input_maps: null,
  description:
    "Scores how well a commit message follows best practices. Returns a score from 0 to 1 based on clarity, format, and accuracy.",
  changelog: null,
  input_schema: {
    // Use anyOf to support various input shapes:
    // 1. Just message
    // 2. Message + diff
    // 3. Message + context
    // 4. Message + diff + context
    anyOf: [
      {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "The commit message to evaluate",
          },
        },
        required: ["message"],
      },
      {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "The commit message to evaluate",
          },
          diff: {
            type: "string",
            description: "The actual code diff for accuracy checking",
          },
        },
        required: ["message", "diff"],
      },
      {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "The commit message to evaluate",
          },
          context: {
            type: "string",
            description: "Additional context about the change",
          },
        },
        required: ["message", "context"],
      },
      {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "The commit message to evaluate",
          },
          diff: {
            type: "string",
            description: "The actual code diff for accuracy checking",
          },
          context: {
            type: "string",
            description: "Additional context about the change",
          },
        },
        required: ["message", "diff", "context"],
      },
    ],
  },
  tasks: [
    {
      type: "vector.completion",
      skip: null,
      map: null,
      messages: [
        {
          role: "system",
          content:
            "You are an expert at evaluating git commit messages. Evaluate commit messages based on: imperative mood ('Add' not 'Added'), subject line length (≤72 chars ideal), specificity (not vague like 'fix' or 'update'), explaining the 'why' not just 'what', and accuracy to any provided diff or context.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: {
                $jmespath:
                  "join('', ['Evaluate this commit message:\\n\\n\"', input.message, '\"'])",
              },
            },
            {
              // Diff section prefix (empty if no diff)
              type: "text",
              text: {
                $jmespath: "if(is_null(input.diff), '', '\\n\\nCode diff:\\n```\\n')",
              },
            },
            {
              // Diff content (empty if no diff)
              type: "text",
              text: {
                $jmespath: "if(is_null(input.diff), '', input.diff)",
              },
            },
            {
              // Diff section suffix (empty if no diff)
              type: "text",
              text: {
                $jmespath: "if(is_null(input.diff), '', '\\n```')",
              },
            },
            {
              // Context section prefix (empty if no context)
              type: "text",
              text: {
                $jmespath: "if(is_null(input.context), '', '\\n\\nContext: ')",
              },
            },
            {
              // Context content (empty if no context)
              type: "text",
              text: {
                $jmespath: "if(is_null(input.context), '', input.context)",
              },
            },
          ],
        },
      ],
      tools: null,
      responses: [
        "EXCELLENT - Clear, concise, imperative mood, explains why, accurately describes changes.",
        "GOOD - Solid message with minor issues (slightly long, could explain why more).",
        "ACCEPTABLE - Gets the job done but could be improved (vague terms, missing context, wrong tense).",
        "POOR - Vague, unclear, misleading, badly formatted, or inaccurate.",
      ],
    },
  ],
  output: {
    // Excellent (1.0) + Good (0.67) + Acceptable (0.33) + Poor (0.0)
    // scores[0]*1.0 + scores[1]*0.67 + scores[2]*0.33 + scores[3]*0.0
    $jmespath:
      "add(tasks[0].scores[0], add(multiply(tasks[0].scores[1], `0.67`), multiply(tasks[0].scores[2], `0.33`)))",
  },
};

export const Profile: Functions.RemoteProfile = {
  description: "Ensemble for evaluating commit message quality.",
  changelog: null,
  tasks: [
    {
      ensemble: {
        llms: [
          {
            model: "openai/gpt-4.1-nano",
            output_mode: "json_schema",
          },
          {
            model: "google/gemini-2.5-flash-lite",
            output_mode: "json_schema",
          },
          {
            model: "x-ai/grok-4.1-fast",
            output_mode: "json_schema",
            reasoning: {
              enabled: false,
            },
          },
          {
            model: "openai/gpt-4o-mini",
            output_mode: "json_schema",
            top_logprobs: 20,
          },
          {
            model: "deepseek/deepseek-v3.2",
            output_mode: "instruction",
            top_logprobs: 20,
          },
        ],
      },
      profile: [1.0, 1.0, 1.0, 1.0, 1.0],
    },
  ],
};

export const ExampleInputs: ExampleInput[] = [
  // Excellent examples - message only
  {
    value: {
      message:
        "Add user authentication via OAuth2 to prevent unauthorized API access",
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: null,
      },
    ],
    outputLength: null,
  },
  {
    value: {
      message: "Fix null pointer exception in PaymentService by adding guard clause",
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: null,
      },
    ],
    outputLength: null,
  },
  // Excellent example with diff
  {
    value: {
      message: "Fix race condition in session cleanup by adding mutex lock",
      diff: "- sessions.delete(id)\n+ mutex.Lock()\n+ defer mutex.Unlock()\n+ sessions.delete(id)",
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: null,
      },
    ],
    outputLength: null,
  },
  // Good examples
  {
    value: {
      message: "Update login form validation",
      context: "Adding email format validation to the login form",
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: null,
      },
    ],
    outputLength: null,
  },
  {
    value: {
      message: "Refactor database connection pooling for better performance",
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: null,
      },
    ],
    outputLength: null,
  },
  // Acceptable examples
  {
    value: {
      message: "Fixed the bug in user registration",
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: null,
      },
    ],
    outputLength: null,
  },
  {
    value: {
      message: "Update styles",
      diff: "- color: blue;\n+ color: #1a73e8;",
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: null,
      },
    ],
    outputLength: null,
  },
  // Poor examples
  {
    value: {
      message: "fix",
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: null,
      },
    ],
    outputLength: null,
  },
  {
    value: {
      message: "wip",
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: null,
      },
    ],
    outputLength: null,
  },
  {
    value: {
      message: "asdfasdf",
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: null,
      },
    ],
    outputLength: null,
  },
  {
    value: {
      message: "Add new feature",
      diff: "- return oldValue;\n+ return newValue; // fixed typo",
      context: "This was actually a bug fix, not a new feature",
    },
    compiledTasks: [
      {
        type: "vector.completion",
        skipped: false,
        mapped: null,
      },
    ],
    outputLength: null,
  },
];
