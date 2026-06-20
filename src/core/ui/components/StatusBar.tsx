/**
 * Status bar component untuk Omakase CLI.
 * @module core/ui/components/StatusBar
 */

import React from 'react'
import { Box, Text } from 'ink'
import type { AppState } from '../../state/AppStateStore.js'

interface StatusBarProps {
  state: AppState
}

/**
 * Status bar component.
 */
export function StatusBar({ state }: StatusBarProps) {
  return (
    <Box marginTop={1} borderTop>
      <Text dimColor>
        {state.isLoading ? 'Thinking...' : 'Ready'}
      </Text>
      {state.error && (
        <Text color="red">
          {' '}| Error: {state.error}
        </Text>
      )}
    </Box>
  )
}