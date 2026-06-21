# Tools

Omakase menyediakan 9 built-in tools.

## Bash

Execute shell commands.

```javascript
{
  name: 'Bash',
  input: {
    command: 'ls -la',
    workingDirectory: '/tmp', // optional
  },
}
```

**Security**: Dangerous commands (`rm -rf`, `sudo`, `dd`, `mkfs`) akan trigger permission prompt.

## FileRead

Read file contents.

```javascript
{
  name: 'FileRead',
  input: {
    path: '/path/to/file',
    limit: 100,    // optional, max lines
    offset: 0,     // optional, line offset
  },
}
```

## FileWrite

Write file contents.

```javascript
{
  name: 'FileWrite',
  input: {
    path: '/path/to/file',
    content: 'Hello, World!',
  },
}
```

**Security**: Writes ke `/etc/`, `/proc/`, `/sys/` akan trigger permission prompt.

## Glob

Find files matching pattern.

```javascript
{
  name: 'Glob',
  input: {
    pattern: '**/*.ts',
    cwd: '/path/to/dir', // optional
  },
}
```

## Grep

Search text in files.

```javascript
{
  name: 'Grep',
  input: {
    pattern: 'TODO',
    path: '/path/to/dir',
    include: '*.ts', // optional
  },
}
```

## TodoWrite

Manage todo list.

```javascript
{
  name: 'TodoWrite',
  input: {
    todos: [
      { content: 'Task 1', status: 'pending' },
      { content: 'Task 2', status: 'in_progress' },
    ],
  },
}
```

## AskUser

Ask user a question.

```javascript
{
  name: 'AskUser',
  input: {
    question: 'Which approach?',
    options: ['Option A', 'Option B', 'Option C'],
  },
}
```

## Config

Manage configuration.

```javascript
{
  name: 'Config',
  input: {
    action: 'get', // 'get', 'set', 'list'
    key: 'provider', // for get/set
    value: 'openai', // for set
  },
}
```

## Memory

Manage persistent memory (OMAKASE.md).

```javascript
{
  name: 'Memory',
  input: {
    action: 'read', // 'read', 'write', 'append'
    content: 'New memory content', // for write/append
  },
}
```

## Next Steps

- [Commands](commands.md) — Slash commands reference
