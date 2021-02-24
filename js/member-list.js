import { Checkbox } from './components/checkbox.js'

const { createElement: e, useEffect, useState } = React

function getName (member) {
  return member.nickname || member.user.username
}
function getMembers (channel) {
  return Array.from(channel.members.values())
    .sort((a, b) => getName(a).localeCompare(getName(b)))
}

export function MemberList ({ channel, onStart, onBack }) {
  const [members, setMembers] = useState(() => getMembers(channel))
  const [selected, setSelected] = useState(() => {
    return getMembers(channel)
      .filter(member => !member.user.bot)
      .map(member => member.id)
  })
  // Ensure that all selected members are still in the VC
  const selectedMembers = selected
    .filter(id => members.find(member => member.id === id))

  useEffect(() => {
    const handleVoiceStateUpdate = (oldState, newState) => {
      if (oldState.channelID === channel.id || newState.channelID === channel.id) {
        setMembers(getMembers(channel))
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
      members.map((member, i) => e(
        'li',
        {
          className: `member-item ${member.user.bot ? 'member-bot' : ''}`,
          key: member.id
        },
        e(Checkbox, {
          checked: selected.includes(member.id),
          onChange: checked => {
            if (checked) {
              if (!selected.includes(member.id)) {
                setSelected([...selected, member.id])
              }
            } else {
              setSelected(selected.filter(id => id !== member.id))
            }
          },
          disabled: member.user.bot
        }),
        e('img', {
          className: 'member-avatar',
          src: member.user.displayAvatarURL({
            format: 'png',
            dynamic: true,
            size: 64
          })
        }),
        e(
          'span',
          { className: 'member-name' },
          getName(member)
        ),
        member.user.bot && e(
          'span',
          { className: 'member-bot-badge' },
          'BOT'
        )
      ))
    ),
    e(
      'button',
      {
        onClick: () => onStart(selectedMembers),
        className: 'start-btn',
        disabled: selectedMembers.length === 0
      },
      'Start'
    )
  )
}
