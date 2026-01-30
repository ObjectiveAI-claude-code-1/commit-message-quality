/**
 * commit-message-quality
 *
 * A scalar ObjectiveAI function that scores how well a commit message
 * follows best practices.
 *
 * Usage:
 *   npm run build  - Build and test the function
 *   npm run test   - Run validation tests
 *
 * Input:
 *   - message (string, required): The commit message to evaluate
 *   - diff (string, optional): Code diff for accuracy checking
 *   - context (string, optional): Additional context about the change
 *
 * Output:
 *   Scalar score in [0, 1] where:
 *   - 1.0 = Excellent commit message
 *   - 0.67 = Good commit message
 *   - 0.33 = Acceptable commit message
 *   - 0.0 = Poor commit message
 */

export { Function, Profile, ExampleInputs } from "./defs";
