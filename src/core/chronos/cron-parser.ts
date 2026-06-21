/**
 * Cron expression parser.
 * @module core/chronos/cron-parser
 */

/**
 * Parsed cron expression.
 */
export interface CronExpression {
  /** Minute field (0-59) */
  minute: number[]
  /** Hour field (0-23) */
  hour: number[]
  /** Day of month field (1-31) */
  dayOfMonth: number[]
  /** Month field (1-12) */
  month: number[]
  /** Day of week field (0-6, 0 = Sunday) */
  dayOfWeek: number[]
}

/**
 * Parse cron field (e.g., wildcard, specific value, comma-separated, range, step).
 *
 * @param field - Cron field string
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Array of matching values
 */
function parseField(field: string, min: number, max: number): number[] {
  const values: Set<number> = new Set()

  for (const part of field.split(',')) {
    if (part === '*') {
      for (let i = min; i <= max; i++) values.add(i)
    } else if (part.includes('/')) {
      const [range, stepStr] = part.split('/')
      const step = parseInt(stepStr, 10)
      if (isNaN(step) || step <= 0) {
        throw new Error(`Invalid step in cron field: ${field}`)
      }

      let start = min
      let end = max
      if (range !== '*') {
        if (range.includes('-')) {
          const [s, e] = range.split('-').map(n => parseInt(n, 10))
          if (isNaN(s) || isNaN(e)) {
            throw new Error(`Invalid range in cron field: ${field}`)
          }
          start = s
          end = e
        } else {
          const v = parseInt(range, 10)
          if (isNaN(v)) {
            throw new Error(`Invalid value in cron field: ${field}`)
          }
          start = v
        }
      }

      for (let i = start; i <= end; i += step) values.add(i)
    } else if (part.includes('-')) {
      const [s, e] = part.split('-').map(n => parseInt(n, 10))
      if (isNaN(s) || isNaN(e)) {
        throw new Error(`Invalid range in cron field: ${field}`)
      }
      for (let i = s; i <= e; i++) values.add(i)
    } else {
      const v = parseInt(part, 10)
      if (isNaN(v)) {
        throw new Error(`Invalid value in cron field: ${field}`)
      }
      if (v < min || v > max) {
        throw new Error(`Value ${v} out of range [${min}, ${max}] in cron field: ${field}`)
      }
      values.add(v)
    }
  }

  return Array.from(values).sort((a, b) => a - b)
}

/**
 * Parse cron expression (5-field: minute hour day month weekday).
 *
 * @param expression - Cron expression string
 * @returns Parsed cron expression
 */
export function parseCron(expression: string): CronExpression {
  const parts = expression.trim().split(/\s+/)
  if (parts.length !== 5) {
    throw new Error(`Invalid cron expression: expected 5 fields, got ${parts.length}`)
  }

  return {
    minute: parseField(parts[0], 0, 59),
    hour: parseField(parts[1], 0, 23),
    dayOfMonth: parseField(parts[2], 1, 31),
    month: parseField(parts[3], 1, 12),
    dayOfWeek: parseField(parts[4], 0, 6),
  }
}

/**
 * Calculate next execution time from cron expression.
 *
 * @param expression - Cron expression string
 * @param from - Start time (default: now)
 * @returns Next execution timestamp
 */
export function getNextCronTime(expression: string, from: number = Date.now()): number {
  const cron = parseCron(expression)
  const start = new Date(from)

  for (let i = 0; i < 366 * 24 * 60; i++) {
    const candidate = new Date(start.getTime() + i * 60 * 1000)
    candidate.setSeconds(0, 0)

    if (i === 0 && start.getSeconds() > 0) continue

    if (
      cron.minute.includes(candidate.getMinutes()) &&
      cron.hour.includes(candidate.getHours()) &&
      cron.dayOfMonth.includes(candidate.getDate()) &&
      cron.month.includes(candidate.getMonth() + 1) &&
      cron.dayOfWeek.includes(candidate.getDay())
    ) {
      return candidate.getTime()
    }
  }

  throw new Error(`No matching time found for cron expression: ${expression}`)
}
