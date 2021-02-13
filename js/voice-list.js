export function renderVoiceChannelList (client) {
  const wrapper = Object.assign(document.createElement('div'), {
    className: 'vc-list'
  })

  const guilds = Array.from(client.guilds.cache.values())
    .sort((a, b) => a.name.localeCompare(b.name))
  for (const guild of guilds) {
    const guildWrapper = Object.assign(document.createElement('div'), {
      className: 'vc-guild-wrapper'
    })
    wrapper.append(guildWrapper)
    const guildName = Object.assign(document.createElement('h2'), {
      className: 'vc-guild-name'
    })
    const guildIcon = guild.iconURL({
      format: 'png',
      dynamic: true,
      size: 32
    })
    if (guildIcon) {
      guildName.append(Object.assign(document.createElement('img'), {
        src: guildIcon,
        className: 'vc-guild-icon'
      }))
    } else {
      guildName.append(Object.assign(document.createElement('div'), {
        className: 'vc-guild-icon vc-guild-no-icon'
      }))
    }
    guildName.append(Object.assign(document.createElement('span'), {
      className: 'vc-guild-name-span',
      textContent: guild.name
    }))
    guildWrapper.append(guildName)

    const channels = Array.from(guild.channels.cache.values())
      .filter(channel => channel.type === 'voice')
      .sort((a, b) => (
        a.parent === b.parent
          ? a.rawPosition - b.rawPosition
          : (a.parent ? a.parent.rawPosition : 0) -
            (b.parent ? b.parent.rawPosition : 0)
      ))
    for (const channel of channels) {
      const channelBtn = Object.assign(document.createElement('button'), {
        className: 'vc-voice-channel',
        textContent: channel.name
      })
      channelBtn.dataset.channelId = channel.id
      guildWrapper.append(channelBtn)
    }
    if (channels.length === 0) {
      const noVcText = Object.assign(document.createElement('p'), {
        className: 'vc-no-vc',
        textContent: 'No voice channels'
      })
      guildWrapper.append(noVcText)
    }
  }

  return {
    wrapper,
    select: new Promise(resolve => {
      const handleClick = e => {
        const vc = e.target.closest('.vc-voice-channel')
        if (vc) {
          const channel = client.channels.cache.get(vc.dataset.channelId)
          if (!channel || channel.type !== 'voice') return
          resolve(channel)
          wrapper.removeEventListener('click', handleClick)
        }
      }

      wrapper.addEventListener('click', handleClick)
    })
  }
}
