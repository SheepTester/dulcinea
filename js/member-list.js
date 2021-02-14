const { createElement: e, useEffect, useState } = React

export function MemberList ({ channel, onStart, onBack }) {
  const [members, setMembers] = useState(() => Array.from(channel.members.values()))

  useEffect(() => {
    const handleVoiceStateUpdate = (oldState, newState) => {
      if (oldState.channelID === channel.id || newState.channelID === channel.id) {
        setMembers(Array.from(channel.members.values()))
      }
    }
    channel.client.on('voiceStateUpdate', handleVoiceStateUpdate)
    return () => {
      channel.client.off('voiceStateUpdate', handleVoiceStateUpdate)
    }
  }, [channel])

  return e(
    'div',
    { className: 'member-list-wrapper' },
    e(
      'h1',
      { className: 'member-list-channel-name big-bold' },
      onBack && e(
        'button',
        { className: 'member-list-back-btn', onClick: onBack },
        e('span', { className: 'material-icons' }, 'arrow_back')
      ),
      channel.name
    ),
    e(
      'ul',
      { className: 'member-list' },
      members.map(member => e(
        'li',
        {
          className: `member-item ${member.user.bot ? 'member-bot' : ''}`,
          key: member.id
        },
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
      {
        onClick: onStart,
        className: 'start-btn',
        disabled: !members.find(member => !member.user.bot)
      },
      'Start'
    )
  )
}
