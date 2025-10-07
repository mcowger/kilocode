Limitations:

- FastApply must be disabled.
- Generate Image probably doesn't work
- MCP servers dont work yet
- Does not respect context limits
- Does not respect non-default mode definitions

Setup:

1.  Add a new provider profile of type Testing Tools
2.  Enter your model slug, BaseURL, API key.
3.  Add the contents of toolstests/basicprompt.md to the System Prompt section. Your existing system prompt is entirely ignored, as are all non-default mode definitions)
4.  Add the contents of tools.json to the Tools.json field
5.  Give it a try!
