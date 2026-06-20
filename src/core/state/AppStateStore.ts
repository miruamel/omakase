/**
 * Application state store.
 * @module core/state
 */

import { EventEmitter } from 'events'
import type { Message } from '../../types/messages/message.ts'
import type { Session } from '../../types/messages/turn.ts'
import type { UserSettings } from '../../types/config/settings.ts'

/**
 * Application state interface.
 */
export interface AppState {
  /** Current session */
  session: Session | null
  /** User settings */
  settings: UserSettings
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: string | null
}

/**
 * State store dengan EventEmitter.
 */
export class AppStateStore extends EventEmitter {
  private static instance: AppStateStore
  private state: AppState = {
    session: null,
    settings: {
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
      maxTokens: 8192,
      temperature: 0.7,
      theme: 'dark',
      permissionMode: 'auto',
    },
    isLoading: false,
    error: null,
  }

  private constructor() {
    super()
  }

  /**
   * Get singleton instance.
   */
  static getInstance(): AppStateStore {
    if (!AppStateStore.instance) {
      AppStateStore.instance = new AppStateStore()
    }
    return AppStateStore.instance
  }

  /**
   * Get current state.
   */
  getState(): AppState {
    return { ...this.state }
  }

  /**
   * Get current session.
   */
  getSession(): Session | null {
    return this.state.session
  }

  /**
   * Get user settings.
   */
  getSettings(): UserSettings {
    return { ...this.state.settings }
  }

  /**
   * Set loading state.
   * 
   * @param loading - Loading state
   */
  setLoading(loading: boolean) {
    this.state.isLoading = loading
    this.emit('change', this.state)
  }

  /**
   * Set error state.
   * 
   * @param error - Error message atau null
   */
  setError(error: string | null) {
    this.state.error = error
    this.emit('change', this.state)
  }

  /**
   * Create new session.
   * 
   * @returns New session
   */
  createSession(): Session {
    const session: Session = {
      id: crypto.randomUUID(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      messages: [],
    }
    this.state.session = session
    this.emit('change', this.state)
    return session
  }

  /**
   * Add message ke session.
   * 
   * @param session - Session
   * @param message - Message untuk add
   */
  addMessage(session: Session, message: Message) {
    session.messages.push(message)
    session.lastActivity = Date.now()
    this.emit('change', this.state)
  }

  /**
   * Update settings.
   * 
   * @param settings - New settings
   */
  updateSettings(settings: Partial<UserSettings>) {
    this.state.settings = { ...this.state.settings, ...settings }
    this.emit('change', this.state)
  }
}

/**
 * Global state instance.
 */
export const appState = AppStateStore.getInstance()