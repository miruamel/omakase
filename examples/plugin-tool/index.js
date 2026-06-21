/**
 * Example plugin that adds a custom tool.
 */

export const tools = [
  {
    name: 'WordCount',
    description: 'Count words and characters in text',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to analyze' },
      },
      required: ['text'],
    },
    async call(args, context) {
      const text = args.text || ''
      const words = text.trim().split(/\s+/).filter(w => w.length > 0)
      const characters = text.length
      const charactersNoSpaces = text.replace(/\s/g, '').length
      const lines = text.split('\n').length

      return {
        toolCallId: crypto.randomUUID(),
        success: true,
        data: {
          words: words.length,
          characters,
          charactersNoSpaces,
          lines,
        },
      }
    },
    async checkPermissions() {
      return { granted: true }
    },
  },
  {
    name: 'Reverse',
    description: 'Reverse a string',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to reverse' },
      },
      required: ['text'],
    },
    async call(args, context) {
      const text = args.text || ''
      const reversed = text.split('').reverse().join('')

      return {
        toolCallId: crypto.randomUUID(),
        success: true,
        data: { reversed },
      }
    },
    async checkPermissions() {
      return { granted: true }
    },
  },
]

export default { tools }
