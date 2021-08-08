import { client } from '../core/'
import { TextChannel, } from 'discord.js'
import { GuildSettings, WatchFeature } from '../core/db/models'
import { Streamer } from '../core/db/streamers'
import { addRelayNotice, getRelayNotices, getSubbedGuilds } from '../core/db/functions'
import { VideoId } from './holodex/frames'
import { canBot, createEmbed, send } from '../helpers/discord'

export async function notifyDiscord (opts: NotifyOptions): Promise<void> {
  const { streamer, subbedGuilds, feature } = opts
  const guilds = subbedGuilds ?? await getSubbedGuilds (streamer?.name, feature)
  guilds.forEach (g => notifyOneGuild (g, opts))
}

export async function notifyOneGuild (
  g: GuildSettings, opts: NotifyOptions
): Promise<void[]> {
  const { streamer, feature, embedBody, emoji } = opts

  const entries  = g[feature].filter (ent => ent.streamer == streamer!.name)
  const guildObj = client.guilds.cache.find (guild => guild.id === g._id)
  const notices  = await getRelayNotices (g._id)
  const announce = notices.get (opts.videoId ?? '')

  return Promise.all (entries.map (({ discordCh, roleToNotify }) => {
    const ch = <TextChannel> guildObj?.channels.cache
                  .find (ch => ch.id === discordCh)
    if (!announce) return send (ch, {
      content: `${roleToNotify ? emoji + ' <@&'+roleToNotify+'>' : ''} `,
      embeds: [createEmbed ({
        author: { name: streamer!.name, iconURL: streamer!.picture },
        thumbnail: { url: streamer!.picture },
        description: embedBody
      })]
    })
    .then (msg => {
      if (msg && feature === 'relay') {
        const ch = msg.channel as TextChannel
        addRelayNotice (g._id, opts.videoId!, msg.id)
        if (canBot ('USE_PUBLIC_THREADS', ch)) return ch.threads.create ({
          name: `Log ${streamer.name} ${opts.videoId}`,
          startMessage: msg,
          autoArchiveDuration: 1440
        })
        .then (thread => {
          if (thread && canBot ('MANAGE_MESSAGES', ch)) {
            msg.pin ()
            setTimeout (() => msg?.unpin (), 86400000)
          }
        })
      }
    })
  }))
}

export interface NotifyOptions {
  subbedGuilds?: GuildSettings[]
  feature:       WatchFeature
  streamer:      Streamer
  embedBody:     string
  emoji:         string
  videoId?:      VideoId
}