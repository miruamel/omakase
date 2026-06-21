/**
 * Logger tests.
 * @module core/services/logger/logger.test
 */

import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { Logger } from './logger.ts'
import type { LogEntry } from '../types/entry.ts'

describe('Logger', () => {
  let logger: Logger
  let mockOutput: { write: any }

  beforeEach(() => {
    logger = new Logger()
    mockOutput = { write: mock(() => {}) }
  })

  it('should create logger with default console output', () => {
    expect(logger).toBeDefined()
  })

  it('should add output', () => {
    logger.addOutput(mockOutput, 'debug')
    logger.debug('test')
    expect(mockOutput.write).toHaveBeenCalled()
  })

  it('should log debug message', () => {
    logger.addOutput(mockOutput, 'debug')
    logger.debug('debug message', { key: 'value' })
    expect(mockOutput.write).toHaveBeenCalledTimes(1)
    const entry = mockOutput.write.mock.calls[0][0] as LogEntry
    expect(entry.level).toBe('debug')
    expect(entry.message).toBe('debug message')
    expect(entry.data).toEqual({ key: 'value' })
  })

  it('should log info message', () => {
    logger.addOutput(mockOutput, 'info')
    logger.info('info message')
    expect(mockOutput.write).toHaveBeenCalledTimes(1)
    const entry = mockOutput.write.mock.calls[0][0] as LogEntry
    expect(entry.level).toBe('info')
    expect(entry.message).toBe('info message')
  })

  it('should log warn message', () => {
    logger.addOutput(mockOutput, 'warn')
    logger.warn('warn message')
    expect(mockOutput.write).toHaveBeenCalledTimes(1)
    const entry = mockOutput.write.mock.calls[0][0] as LogEntry
    expect(entry.level).toBe('warn')
  })

  it('should log error message', () => {
    logger.addOutput(mockOutput, 'error')
    const error = new Error('test error')
    logger.error('error message', error)
    expect(mockOutput.write).toHaveBeenCalledTimes(1)
    const entry = mockOutput.write.mock.calls[0][0] as LogEntry
    expect(entry.level).toBe('error')
    expect(entry.data.error).toBe('test error')
    expect(entry.data.stack).toBeDefined()
  })

  it('should respect log level filter', () => {
    logger.addOutput(mockOutput, 'warn')
    logger.debug('debug')
    logger.info('info')
    logger.warn('warn')
    logger.error('error')
    expect(mockOutput.write).toHaveBeenCalledTimes(2)
  })

  it('should include timestamp in entry', () => {
    logger.addOutput(mockOutput, 'debug')
    const before = Date.now()
    logger.info('test')
    const after = Date.now()
    const entry = mockOutput.write.mock.calls[0][0] as LogEntry
    expect(entry.timestamp).toBeGreaterThanOrEqual(before)
    expect(entry.timestamp).toBeLessThanOrEqual(after)
  })

  it('should support multiple outputs', () => {
    const output1 = { write: mock(() => {}) }
    const output2 = { write: mock(() => {}) }
    logger.addOutput(output1, 'debug')
    logger.addOutput(output2, 'debug')
    logger.info('test')
    expect(output1.write).toHaveBeenCalledTimes(1)
    expect(output2.write).toHaveBeenCalledTimes(1)
  })

  it('should handle error without Error object', () => {
    logger.addOutput(mockOutput, 'error')
    logger.error('error message')
    expect(mockOutput.write).toHaveBeenCalledTimes(1)
    const entry = mockOutput.write.mock.calls[0][0] as LogEntry
    expect(entry.data.error).toBeUndefined()
  })
})
