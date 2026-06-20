/**
 * Header component untuk Omakase CLI.
 * @module core/ui/components/Header
 */

import React from 'react'
import { Box, Text } from 'ink'
import type { UserSettings } from '../../../types/config/settings/index.js'

interface HeaderProps {
  settings: UserSettings
}

/**
 * Header component dengan info provider dan model.
 */
export function Header({ settings }: HeaderProps) {
  return (
    <Box marginBottom={1} borderBottom>
      <Text bold color="blue">
        Omakase v0.0.1
      </Text>
      <Text dimColor>
        {' '}| {settings.provider}:{settings.model}
      </Text>
    </Box>
  )
}