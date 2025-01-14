import { Command, emoji } from '../../helpers/discord'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { validateInputAndModifyEntryList } from '../db/functions'

const usage = 'cameos <add|remove> <streamer name>'

export const cameos: Command = {
  config: {
    aliases:   ['holochats'],
    permLevel: 2
  },
  help: {
    category: 'Notifs',
    usage,
    description: oneLine`
      Start or stop relaying a streamer's appearances in other
      streamers' livechat.
    `,
  },
  callback: (msg: Message, [verb, ...name]: string[]): void => {
    const streamer = name.join (' ')
    validateInputAndModifyEntryList ({
      msg, verb, streamer, usage,
      feature: 'cameos',
      add: {
        success: `${emoji.holo} Relaying cameos in other chats`,
        failure: oneLine`
          :warning: ${streamer}'s cameos in other chats already being
          relayed in this channel.
        `
      },
      remove: {
        success: `${emoji.holo} Stopped relaying chat cameos`,
        failure: oneLine`
          :warning: ${streamer}'s cameos' weren't already being relayed
          in <#${msg.channel.id}>. Are you in the right channel?
        `,
      },
    })
  }
}
