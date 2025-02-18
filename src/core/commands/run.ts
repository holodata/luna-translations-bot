import { Command } from '../../helpers/discord'
import { Message } from 'discord.js'
import { inspect } from 'util'
import { config } from '../../config'
import { client } from '../lunaBotClient' // for eval scope
import { getSettings, updateSettings, getGuildData, updateGuildData } from '../db/functions'
import { tryOrDefault } from '../../helpers/tryCatch'
import { reply } from '../../helpers/discord/sendMessages'

export const run: Command = {
  config: {
    aliases:   ['eval'],
    permLevel: 10
  },
  help: {
    category:    'System',
    usage:       'run <code>',
    description: 'Evaluates arbitrary JS.',
  },
  callback: async (msg: Message, args: string[]): Promise<void> => {
    const output = await processCode (msg, args)
    reply (msg, undefined, '```js\n' + output + '\n```')
  }
}

///////////////////////////////////////////////////////////////////////////////

async function processCode (msg: Message, code: string[]): Promise<string> {
  // keep imports in eval scope via _
  const _ = { client, getSettings, updateSettings, getGuildData, updateGuildData }
  const evaled  = await tryOrDefault (() => eval (code.join (' ')), '')
  const string  = toString (evaled)
  const cleaned = string
    .replace (/`/g, "`" + String.fromCharCode (8203))
    .replace (/@/g, "@" + String.fromCharCode (8203))
    .replaceAll (config.token ?? '[censored]', '[censored]')
    .replaceAll (config.deeplKey ?? '[censored]', '[censored]')
  return cleaned
}

function toString (x: any): string {
  return typeof x === 'string' ? x : inspect (x, { depth: 1 })
}
