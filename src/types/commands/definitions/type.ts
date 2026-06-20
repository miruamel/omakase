/**
 * Tipe command: prompt (ke LLM), local (text), atau local-jsx (React)
 * @packageDocumentation
 */

/**
 * CommandType menentukan bagaimana command dieksekusi.
 * - `prompt`: Command mengirim prompt ke LLM untuk diproses
 * - `local`: Command dijalankan lokal dan return text
 * - `local-jsx`: Command dijalankan lokal dan return React JSX
 */
export type CommandType = 'prompt' | 'local' | 'local-jsx'