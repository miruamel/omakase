/**
 * Cron parser tests.
 * @module core/chronos/cron-parser.test
 */

import { describe, it, expect } from 'bun:test'
import { parseCron, getNextCronTime } from './cron-parser.ts'

describe('parseCron', () => {
  it('should parse wildcard expression', () => {
    const result = parseCron('* * * * *')
    expect(result.minute.length).toBe(60)
    expect(result.hour.length).toBe(24)
    expect(result.dayOfMonth.length).toBe(31)
    expect(result.month.length).toBe(12)
    expect(result.dayOfWeek.length).toBe(7)
  })

  it('should parse specific values', () => {
    const result = parseCron('5 12 15 6 3')
    expect(result.minute).toEqual([5])
    expect(result.hour).toEqual([12])
    expect(result.dayOfMonth).toEqual([15])
    expect(result.month).toEqual([6])
    expect(result.dayOfWeek).toEqual([3])
  })

  it('should parse comma-separated values', () => {
    const result = parseCron('1,3,5 * * * *')
    expect(result.minute).toEqual([1, 3, 5])
  })

  it('should parse range', () => {
    const result = parseCron('0-5 * * * *')
    expect(result.minute).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('should parse step values', () => {
    const result = parseCron('*/15 * * * *')
    expect(result.minute).toEqual([0, 15, 30, 45])
  })

  it('should throw on invalid field count', () => {
    expect(() => parseCron('* * *')).toThrow('expected 5 fields')
  })

  it('should throw on out-of-range value', () => {
    expect(() => parseCron('60 * * * *')).toThrow('out of range')
  })

  it('should throw on invalid value', () => {
    expect(() => parseCron('abc * * * *')).toThrow('Invalid value')
  })
})

describe('getNextCronTime', () => {
  it('should find next execution for every minute', () => {
    const from = new Date('2026-06-21T10:30:15').getTime()
    const next = getNextCronTime('* * * * *', from)
    const nextDate = new Date(next)
    expect(nextDate.getMinutes()).toBe(31)
    expect(nextDate.getSeconds()).toBe(0)
  })

  it('should find next execution for specific time', () => {
    const from = new Date('2026-06-21T10:30:00').getTime()
    const next = getNextCronTime('0 12 * * *', from)
    const nextDate = new Date(next)
    expect(nextDate.getHours()).toBe(12)
    expect(nextDate.getMinutes()).toBe(0)
  })

  it('should find next execution for specific day of week', () => {
    const from = new Date('2026-06-21T10:00:00').getTime()
    const next = getNextCronTime('0 0 * * 1', from)
    const nextDate = new Date(next)
    expect(nextDate.getDay()).toBe(1)
  })
})
