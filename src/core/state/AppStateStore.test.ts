/**
 * AppStateStore tests.
 * @module core/state/AppStateStore.test
 */

import { describe, it, expect } from 'bun:test'
import { AppStateStore } from './AppStateStore.ts'

describe('AppStateStore', () => {
  it('should be singleton', () => {
    const a = AppStateStore.getInstance()
    const b = AppStateStore.getInstance()
    expect(a).toBe(b)
  })

  it('should have default settings', () => {
    const store = AppStateStore.getInstance()
    const settings = store.getSettings()
    expect(settings.provider).toBe('anthropic')
    expect(settings.model).toBe('claude-sonnet-4-20250514')
    expect(settings.maxTokens).toBe(8192)
  })

  it('should update settings', () => {
    const store = AppStateStore.getInstance()
    store.updateSettings({ provider: 'openai', model: 'gpt-4' })
    const settings = store.getSettings()
    expect(settings.provider).toBe('openai')
    expect(settings.model).toBe('gpt-4')
  })

  it('should create session', () => {
    const store = AppStateStore.getInstance()
    const session = store.createSession()
    expect(session.id).toBeDefined()
    expect(session.messages).toEqual([])
    expect(store.getSession()).toBe(session)
  })

  it('should add message to session', () => {
    const store = AppStateStore.getInstance()
    const session = store.createSession()
    store.addMessage(session, { role: 'user', content: 'Hello' })
    expect(session.messages.length).toBe(1)
    expect(session.messages[0].content).toBe('Hello')
  })

  it('should set loading state', () => {
    const store = AppStateStore.getInstance()
    store.setLoading(true)
    expect(store.getState().isLoading).toBe(true)
    store.setLoading(false)
    expect(store.getState().isLoading).toBe(false)
  })

  it('should set error state', () => {
    const store = AppStateStore.getInstance()
    store.setError('Something went wrong')
    expect(store.getState().error).toBe('Something went wrong')
    store.setError(null)
    expect(store.getState().error).toBe(null)
  })

  it('should emit change event', () => {
    const store = AppStateStore.getInstance()
    let emitted = false
    store.on('change', () => {
      emitted = true
    })
    store.setLoading(true)
    expect(emitted).toBe(true)
  })

  it('should return copy of state', () => {
    const store = AppStateStore.getInstance()
    const state1 = store.getState()
    const state2 = store.getState()
    expect(state1).not.toBe(state2)
    expect(state1).toEqual(state2)
  })
})
