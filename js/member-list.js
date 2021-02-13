const { createElement: e, useEffect, useState } = React

function MemberList ({ channel, onStart }) {
  const [members, setMembers] = useState(() => Array.from(channel.members.values()))

  useEffect(() => {
    const handleVoiceStateUpdate = (oldState, newState) => {
      if (oldState.channelID === channel.id || newState.channelID === channel.id) {
        console.log(Array.from(channel.members.values()))
        setMembers(Array.from(channel.members.values()))
      }
    }
    channel.client.on('voiceStateUpdate', handleVoiceStateUpdate)
    return () => {
      channel.client.off('voiceStateUpdate', handleVoiceStateUpdate)
    }
  }, [channel])

  const users = members.filter(member => !member.user.bot)
  return e(
    'div',
    { className: 'member-list-wrapper' },
    e(
      'ul',
      { className: 'member-list' },
      users.map(member => e(
        'li',
        { className: 'member-item', key: member.id },
        e('img', {
          src: member.user.displayAvatarURL({
            format: 'png',
            dynamic: true,
            size: 32
          })
        }),
        e(
          'span',
          { className: 'member-name' },
          member.nickname || member.user.username
        )
      ))
    ),
    e(
      'button',
      { onClick: onStart, disabled: users.length === 0 },
      'Start'
    )
  )
}

export function members (channel) {
  const root = document.getElementById('member-list-root')

  return new Promise(resolve => {
    ReactDOM.render(
      e(
        React.StrictMode,
        null,
        e(
          MemberList,
          { channel, onStart: resolve }
        )
      ),
      root
    )
  }).then(() => {
    ReactDOM.unmountComponentAtNode(root)
  })
}
