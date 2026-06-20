/**
 * Input prompt component untuk Omakase CLI.
 * @module core/ui/components/InputPrompt
 */

import React from 'react'
import { Box, Text } from 'ink'

interface InputPromptProps {
  input: string
}

/**
 * Input prompt component.
 */
export function InputPrompt({ input }: InputPromptProps) {
  return (
    <Box>
      <Text bold color="green">
        {'>'}{' '}
      </Text>
      <Text>{input}</Text>
      <Text>{'\u2588'}</Text>
    </Box>
  )
}