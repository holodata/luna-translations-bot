import { client } from '../'
import { config } from '../../config'
import { log } from '../../helpers'
import {clearOldData} from '../db/functions'

export async function ready () {
  log (`${client.user!.tag} serving ${client.guilds.cache.size} servers.`)
  client.user!.setActivity (`${config.prefix}help`, { type: 'PLAYING' })
  import ('../../modules/community/communityNotifier')
  import ('../../modules/youtubeNotifier')
  import ('../../modules/twitcastingNotifier')
  import ('../../modules/livechat/chatRelayer')

  setInterval (clearOldData, 24*60*60*100)
}
