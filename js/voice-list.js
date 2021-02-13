export function renderVoiceChannelList (client) {
  const wrapper = Object.assign(document.createElement('div'), {
    className: 'vc-list'
  })

  for (const guild of client.guilds.cache.values()) {
    const guildWrapper = Object.assign(document.createElement('div'), {
      className: 'vc-guild-wrapper'
    })
    wrapper.append(guildWrapper)
    guildWrapper.append(Object.assign(document.createElement('h2'), {
      className: 'vc-guild-name',
      textContent: guild.name
    }))

    for (const channel of guild.channels.cache.values()) {
      if (channel.type !== 'voice') continue
      const channelBtn = Object.assign(document.createElement('button'), {
        className: 'vc-voice-channel',
        textContent: channel.name
      })
      channelBtn.dataset.channelId = channel.id
      guildWrapper.append(channelBtn)
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
