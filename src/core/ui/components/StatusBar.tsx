/**
 * Status bar component untuk Omakase CLI.
 * @module core/ui/components/StatusBar
 */

import React from 'react'
import { Box, Text } from 'ink'
import type { AppState } from '../../state/AppStateStore.js'

interface StatusBarProps {
  state: AppState
  providerStatus?: Array<{ name: string; isHealthy: boolean }>
}

export function StatusBar({ state, providerStatus }: StatusBarProps) {
  const healthyCount = providerStatus?.filter(p => p.isHealthy).length || 0
  const totalCount = providerStatus?.length || 0

  return (
    <Box marginTop={1} borderTop>
      <Text dimColor>
        {state.isLoading ? 'Thinking...' : 'Ready'}
      </Text>
      {totalCount > 0 && (
        <Text dim color={healthyCount > 0 ? 'green' : 'red'}>
          {' '}| Providers: {healthyCount}/{totalCount} healthy
        </Text>
      )}
      {state.error && (
        <Text color="red">
          {' '}| Error: {state.error}
        </Text>
      )}
    </Box>
  )
}