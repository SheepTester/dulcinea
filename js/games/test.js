import { Answers } from '../answers.js'
import { wait } from '../utils.js'
import { Timer } from '../timer.js'

const { createElement: e, useEffect, useState } = React

function Game ({ channel, onEnd }) {
  const [answers, setAnswers] = useState(null)
  const [endTime, setEndTime] = useState(null)

  useEffect(async () => {
    const answerExpecter = new Answers(channel)
    for (let i = 0; i < 3; i++) {
      setEndTime(Date.now() + 10000)
      const answers = await answerExpecter.expectAnswers(10000)
      setAnswers(Array.from(answers.entries()))
    }
    setEndTime(null)
    onEnd()
  }, [onEnd])

  return e(
    'div',
    null,
    `DM ${channel.client.user.tag} your answer! `,
    endTime && e(
      React.Fragment,
      null,
      'You have ',
      e(Timer, { endTime }),
      's left.'
    ),
    answers && answers.map(([userId, message]) => (
      message
        ? e('p', { key: userId }, `${message.author.tag} says, "${message.content}"`)
        : e('p', { key: userId }, `${channel.client.users.cache.get(userId).tag} didn't say anything.`)
    ))
  )
}

export function game (channel, root) {
  document.body.classList.add('game-test')
  return new Promise(resolve => {
    ReactDOM.render(
      e(
        React.StrictMode,
        null,
        e(
          Game,
          {
            channel,
            onEnd: resolve
          }
        )
      ),
      root
    )
  }).then(() => {
    ReactDOM.unmountComponentAtNode(root)
    document.body.classList.remove('game-test')
  })
}
