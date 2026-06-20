/**
 * Message list component untuk Omakase CLI.
 * @module core/ui/components/MessageList
 */

import React from 'react'
import { Box, Text } from 'ink'
import type { Message } from '../../../types/messages/index.js'

interface MessageListProps {
  messages: Message[]
  loading: boolean
}

/**
 * Message list component.
 */
export function MessageList({ messages, loading }: MessageListProps) {
  return (
    <Box flexDirection="column" marginBottom={1} flexGrow={1}>
      {messages.map((msg, i) => (
        <Box key={i} marginBottom={0}>
          {msg.role === 'user' ? (
            <Text bold color="green">
              You: {msg.content}
            </Text>
          ) : (
            <Text color="cyan">
              Omakase: {msg.content}
            </Text>
          )}
        </Box>
      ))}
      {loading && (
        <Text dimColor>Thinking...</Text>
      )}
    </Box>
  )
}