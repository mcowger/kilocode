# native-tools.md

We are working on a proof of concept of making native tool calls work in this Kilocode extension.

## Guidelines

- This is merely a proof of concept. We do not need to write or run tests.
- We will use console.debug() extensively. These lines should not be removed, and should be added when we add new functionality
- We limit our modifications as much as possible, and constrain them to AssistantMessageParser.ts, Task.ts, stream.ts and testing-tools.ts. Any other modifications to other files must be confirmed by the user.
