import { expectAnswers } from '../answers.js'
import { wait } from '../utils.js'

const { createElement: e, useEffect, useState } = React

function Game ({ channel, onEnd }) {
  const [answers, setAnswers] = useState(null)

  useEffect(async () => {
    const answers = await expectAnswers(channel, 10000)
    setAnswers(Array.from(answers.entries()))
    await wait(1000000) // big number
    onEnd()
  }, [onEnd])
  console.log(answers);
  return e(
    'div',
    null,
    `DM ${channel.client.user.tag} your answer!`,
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
