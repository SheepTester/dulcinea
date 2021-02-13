import { MemberList } from './member-list.js'

const { createElement: e, useEffect, useState } = React

function getGuilds (client) {
  return Array.from(client.guilds.cache.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(guild => {
      const icon = guild.iconURL({
        format: 'png',
        dynamic: true,
        size: 32
      })
      const channels = Array.from(guild.channels.cache.values())
        .filter(channel => channel.type === 'voice')
        .sort((a, b) => (
          a.parent === b.parent
            ? a.rawPosition - b.rawPosition
            : (a.parent ? a.parent.rawPosition : 0) -
              (b.parent ? b.parent.rawPosition : 0)
        ))
        .map(channel => ({
          id: channel.id,
          name: channel.name,
          members: channel.members.size
        }))

      return {
        id: guild.id,
        icon,
        name: guild.name,
        channels
      }
    })
}

function VoiceChannelList ({ client, onChannel }) {
  const [guilds, setGuilds] = useState(() => getGuilds(client))

  useEffect(() => {
    const handleVoiceStateUpdate = (oldState, newState) => {
      setGuilds(getGuilds(client))
    }
    client.on('voiceStateUpdate', handleVoiceStateUpdate)
    return () => {
      client.off('voiceStateUpdate', handleVoiceStateUpdate)
    }
  }, [client])

  return e(
    'div',
    { className: 'vc-list-wrapper' },
    e('h1', { className: 'vc-list-heading big-bold' }, 'Select a voice channel.'),
    e(
      'div',
      { className: 'vc-list' },
      guilds.map(guild => e(
        'div',
        { className: 'vc-guild-wrapper', key: guild.id },
        e(
          'h2',
          { className: 'vc-guild-name' },
          guild.icon ? e('img', {
            className: 'vc-guild-icon',
            src: guild.icon
          }) : e('div', {
            className: 'vc-guild-icon vc-guild-no-icon'
          }),
          e('span', { className: 'vc-guild-name-span' }, guild.name)
        ),
        guild.channels.map(channel => e(
          'button',
          {
            className: 'vc-voice-channel',
            onClick: () => onChannel(channel.id),
            key: channel.id
          },
          e('span', { className: 'vc-voice-channel-name' }, channel.name),
          channel.members > 0 && e(
            'span',
            { className: 'vc-voice-channel-members' },
            channel.members
          )
        )),
        guild.channels.length === 0 && e(
          'div',
          { className: 'vc-no-vc' },
          'No voice channels'
        )
      )),
      guilds.length === 0 && e(
        'div',
        { className: 'vc-no-vc' },
        'The bot is not in any servers'
      )
    )
  )
}

function VcOrMemberList ({ client, onStart }) {
  const [channel, setChannel] = useState(null)

  if (channel) {
    return e(
      MemberList,
      {
        channel,
        onStart: () => onStart(channel),
        onBack: () => setChannel(null)
      }
    )
  } else {
    return e(
      VoiceChannelList,
      {
        client,
        onChannel: channelId => {
          const channel = client.channels.cache.get(channelId)
          if (channel && channel.type === 'voice') {
            setChannel(channel)
          }
        }
      }
    )
  }
}

export function selectVoiceChannel (client, root) {
  return new Promise(resolve => {
    ReactDOM.render(
      e(
        React.StrictMode,
        null,
        e(
          VcOrMemberList,
          {
            client,
            onStart: resolve
          }
        )
      ),
      root
    )
  }).then(channel => {
    ReactDOM.unmountComponentAtNode(root)
    return channel
  })
}
