/**
 * Main App component untuk Omakase CLI.
 * @module App
 */

import React, { useState, useCallback } from 'react'
import { Box, useInput } from 'ink'
import { appState } from './core/state/AppStateStore.js'
import { QueryEngine } from './core/engine/engine.js'
import { createAnthropicProvider } from './core/providers/anthropic/client.js'
import { createOpenAIProvider } from './core/providers/openai/client.js'
import { createOllamaProvider } from './core/providers/ollama/client.js'
import { createNvidiaProvider } from './core/providers/nvidia/client.js'
import { listTools } from './core/tools/index.js'
import { commands } from './commands/index.js'
import type { Message, ToolCall } from './types/messages/index.js'
import { logger } from './core/services/logger/logger/logger.ts'
import { Header, MessageList, InputPrompt, StatusBar } from './core/ui/components/index.js'
import { RuntimeContext, setRuntime } from './core/runtime/index.ts'

/**
 * Get provider by name.
 * 
 * @param providerName - Provider name
 * @param apiKey - API key (for anthropic/openai/nvidia)
 * @param endpoint - Endpoint (for ollama/nvidia)
 * @returns LLMProvider instance
 */
function getProvider(providerName: string, apiKey?: string, endpoint?: string) {
  switch (providerName) {
    case 'anthropic':
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY not set')
      }
      return createAnthropicProvider(apiKey)
    case 'openai':
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY not set')
      }
      return createOpenAIProvider(apiKey)
    case 'ollama':
      return createOllamaProvider(endpoint)
    case 'nvidia':
      if (!apiKey) {
        throw new Error('NVIDIA_API_KEY not set')
      }
      return createNvidiaProvider(apiKey, endpoint)
    default:
      throw new Error(`Unknown provider: ${providerName}`)
  }
}

/**
 * Main App component.
 */
export function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const settings = appState.getSettings()
  const session = appState.getSession()

  const [queryEngine] = useState(() => {
    const providerName = settings.provider
    let apiKey: string | undefined
    let endpoint: string | undefined

    if (providerName === 'anthropic') {
      apiKey = process.env.ANTHROPIC_API_KEY
    } else if (providerName === 'openai') {
      apiKey = process.env.OPENAI_API_KEY
  } else if (providerName === 'nvidia') {
    apiKey = process.env.NVIDIA_API_KEY
    endpoint = process.env.OMAKASE_NVIDIA_ENDPOINT || settings.nvidiaEndpoint
    } else if (providerName === 'ollama') {
      endpoint = process.env.OMAKASE_OLLAMA_ENDPOINT
    }

    try {
      const provider = getProvider(providerName, apiKey, endpoint)
      const tools = listTools()
      const runtime = new RuntimeContext(provider, tools)
      setRuntime(runtime)
      return new QueryEngine(provider)
    } catch (error) {
      logger.error('Failed to initialize provider', error as Error)
      throw error
    }
  })

  const handleInput = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return

    if (userMessage.startsWith('/')) {
      await handleCommand(userMessage)
      return
    }

    const userMsg: Message = { role: 'user', content: userMessage }
    appState.addMessage(session!, userMsg)
    setMessages(prev => [...prev, userMsg])

    setLoading(true)

    try {
      const tools = listTools()
      const response = await queryEngine.sendMessage([...messages, userMsg], tools)

      if (response.content) {
        const assistantMsg: Message = { role: 'assistant', content: response.content }
        appState.addMessage(session!, assistantMsg)
        setMessages(prev => [...prev, assistantMsg])
      }

      if (response.toolCalls) {
        await executeToolCalls(response.toolCalls)
      }
    } catch (error) {
      const errorMsg: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : String(error)}`,
      }
      appState.addMessage(session!, errorMsg)
      setMessages(prev => [...prev, errorMsg])
      logger.error('Handle input failed', error as Error)
    }

    setLoading(false)
  }, [messages, session, queryEngine])

  const handleCommand = useCallback(async (cmdString: string) => {
    const parts = cmdString.slice(1).split(' ')
    const cmdName = parts[0]
    const args = parts.slice(1)

    const command = commands[cmdName]
    if (!command) {
      const errorMsg: Message = {
        role: 'assistant',
        content: `Unknown command: /${cmdName}. Type /help for available commands.`,
      }
      appState.addMessage(session!, errorMsg)
      setMessages(prev => [...prev, errorMsg])
      return
    }

    try {
      const result = await command.execute(args, {
        session: session!,
        settings,
        workingDirectory: process.cwd(),
      })

      if (result.type === 'text') {
        const msg: Message = { role: 'assistant', content: result.content as string }
        appState.addMessage(session!, msg)
        setMessages(prev => [...prev, msg])
      } else if (result.type === 'prompt') {
        for (const msg of result.content as Message[]) {
          appState.addMessage(session!, msg)
          setMessages(prev => [...prev, msg])
        }
      }
    } catch (error) {
      logger.error('Command execution failed', error as Error)
      const errorMsg: Message = {
        role: 'assistant',
        content: `Command failed: ${error instanceof Error ? error.message : String(error)}`,
      }
      appState.addMessage(session!, errorMsg)
      setMessages(prev => [...prev, errorMsg])
    }
  }, [session, settings])

  const executeToolCalls = useCallback(async (toolCalls: ToolCall[]) => {
    const tools = listTools().reduce((acc, t) => {
      acc[t.name] = t
      return acc
    }, {} as Record<string, any>)

    for (const toolCall of toolCalls) {
      const result = await queryEngine.executeToolCall(toolCall, tools, {
        session: session!,
        workingDirectory: process.cwd(),
        permissionMode: settings.permissionMode,
      }) as any

      if (result.success && result.data !== undefined) {
        const resultMsg: Message = {
          role: 'assistant',
          content: `✓ ${toolCall.name}: ${JSON.stringify(result.data, null, 2)}`,
        }
        appState.addMessage(session!, resultMsg)
        setMessages(prev => [...prev, resultMsg])
      } else {
        const errorMsg: Message = {
          role: 'assistant',
          content: `✗ ${toolCall.name} failed: ${result.error || 'Unknown error'}`,
        }
        appState.addMessage(session!, errorMsg)
        setMessages(prev => [...prev, errorMsg])
      }
    }
  }, [queryEngine, session, settings.permissionMode])

  useInput((value, key) => {
    if (key.return) {
      handleInput(input)
      setInput('')
    } else if (key.backspace) {
      setInput(prev => prev.slice(0, -1))
    } else if (key.ctrl && value === 'c') {
      process.exit(0)
    } else {
      setInput(prev => prev + value)
    }
  })

  return (
    <Box flexDirection="column" padding={1}>
      <Header settings={settings} />
      <MessageList messages={messages} loading={loading} />
      <InputPrompt input={input} />
      <StatusBar state={appState.getState()} />
    </Box>
  )
}