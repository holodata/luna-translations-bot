import { Command, createEmbedMessage, reply } from '../../helpers/discord'
import { oneLine } from 'common-tags'
import { getSettings, updateSettings, removeBlacklisted } from '../db/functions'
import { Message } from 'discord.js'
import { head, init, last, isEmpty } from 'ramda'

export const unblacklist: Command = {
  config: {
    aliases:   ['ub', 'unb', 'unbl'],
    permLevel: 1
  },
  help: {
    category: 'Relay',
    usage:    'unblacklist <optional channel ID>',
    description: oneLine`
      Unblacklists the specified channel ID.
      If none specified, unblacklists last item.
    `,
  },
  callback: (msg: Message, args: string[]): void => {
    const processMsg = isEmpty (args) ? unblacklistLastItem
                                      : unblacklistItem
    processMsg (msg, head (args)!)
  }
}

///////////////////////////////////////////////////////////////////////////////

function unblacklistLastItem (msg: Message): void {
  const { blacklist }   = getSettings (msg)
  const lastBlacklisted = last (blacklist)
  const replyContent    = lastBlacklisted
    ? oneLine`
      :white_check_mark: Successfully unblacklisted channel
      ${lastBlacklisted.ytId} (${lastBlacklisted.name}).
    `
    : ':warning: No items in blacklist.'

  reply (msg, createEmbedMessage (replyContent))
  if (lastBlacklisted) updateSettings (msg, { blacklist: init (blacklist) })
}

function unblacklistItem (msg: Message, ytId: string): void {
  const success = removeBlacklisted (msg.guild!, ytId)
  reply (msg, createEmbedMessage (success
    ? `:white_check_mark: Successfully unblacklisted ${ytId}.`
    : `:warning: YouTube channel ID ${ytId} was not found.`
  ))
}
