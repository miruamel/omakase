/**
 * Example Omakase plugin.
 * Exports a command definition that can be loaded by Omakase.
 */

export const command = {
  name: 'hello',
  description: 'Say hello from a plugin',
  async execute(args) {
    const name = args || 'World'
    console.log(`Hello, ${name}! (from plugin-hello)`)
  },
}

export default { command }
