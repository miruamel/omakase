# Chronos Scheduler

Chronos adalah background task scheduler untuk Omakase.

## Task Types

### Once

Jalankan sekali pada waktu tertentu.

```typescript
chronos.schedule({
  name: 'one-time-task',
  type: 'once',
  delayMs: 5000, // 5 detik dari sekarang
  handler: async () => {
    console.log('Task executed!')
  },
})
```

### Delayed

Jalankan setelah delay tertentu.

```typescript
chronos.schedule({
  name: 'delayed-task',
  type: 'delayed',
  delayMs: 60000, // 1 menit
  handler: async () => {
    console.log('Delayed task executed!')
  },
})
```

### Interval

Jalankan secara periodic.

```typescript
chronos.schedule({
  name: 'periodic-task',
  type: 'interval',
  intervalMs: 30000, // Setiap 30 detik
  maxExecutions: 10, // Maksimal 10 kali
  handler: async () => {
    console.log('Periodic task executed!')
  },
})
```

### Cron

Jalankan berdasarkan cron expression.

```typescript
chronos.schedule({
  name: 'cron-task',
  type: 'cron',
  cronExpression: '0 */2 * * *', // Setiap 2 jam
  handler: async () => {
    console.log('Cron task executed!')
  },
})
```

## Cron Expression Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-6, 0 = Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

### Examples

| Expression | Description |
|------------|-------------|
| `* * * * *` | Every minute |
| `0 * * * *` | Every hour |
| `0 0 * * *` | Every day at midnight |
| `0 9 * * 1-5` | Weekdays at 9 AM |
| `*/15 * * * *` | Every 15 minutes |
| `0 0 1 * *` | First day of every month |

### Special Syntax

- `*` — Any value
- `,` — Value list separator (e.g., `1,3,5`)
- `-` — Range of values (e.g., `1-5`)
- `/` — Step values (e.g., `*/15`)

## Commands

```bash
# List semua tasks
omakase /chronos list

# Schedule task
omakase /chronos schedule --name my-task --type interval --interval 30000

# Cancel task
omakase /chronos cancel <task-id>
```

## Next Steps

- [Plugin Development](plugins.md) — Extend Omakase
