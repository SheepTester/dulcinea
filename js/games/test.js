import { Answers } from '../answers.js'
import { wait, shuffleInPlace } from '../utils.js'
import { Timer } from '../timer.js'

const { createElement: e, useEffect, useState } = React

const emoji = []
// Add regional indicators A-Z
for (let i = 0x1f1e6; i <= 0x1f1ff; i++) {
  emoji.push(String.fromCodePoint(i))
}

const questionsPromise = fetch(new URL('../questions.json', import.meta.url))
  .then(response => response.json())

function Game ({ channel, onEnd }) {
  const [answers, setAnswers] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [votes, setVotes] = useState(null)

  useEffect(async () => {
    const questions = [...await questionsPromise]
    const memberIds = shuffleInPlace(Array.from(
      channel.members
        .filter(member => !member.user.bot)
        .keys()
    ))
    const pairs = new Map() // Question => UserId[]
    const prompts = new Map(memberIds.map(userId => [userId, []])) // UserId => Question[]
    for (let i = 0; i < memberIds.length; i++) {
      const [prompt] = questions.splice(Math.floor(Math.random() * questions.length), 1)
      if (i === 0) {
        prompts.get(memberIds[0]).push(prompt)
        prompts.get(memberIds[memberIds.length - 1]).push(prompt)
        pairs.set(prompt, [memberIds[0], memberIds[memberIds.length - 1]])
      } else {
        prompts.get(memberIds[i]).push(prompt)
        prompts.get(memberIds[i - 1]).push(prompt)
        pairs.set(prompt, [memberIds[i], memberIds[i - 1]])
      }
    }

    const answerExpecter = new Answers(channel)
    // setEndTime(Date.now() + 10000)
    // const answers = await answerExpecter.expectAnswers(10000)
    // setAnswers(Array.from(answers.entries()))
    setEndTime(Date.now() + 10000)
    const votes = await answerExpecter.expectVotes(10000, emoji.slice(0, 3))
    setVotes(Array.from(votes.entries()))
    setEndTime(null)
    await wait(10000)
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
    )),
    votes && votes.map(([userId, vote]) => (
      vote
        ? e('p', { key: userId }, `${channel.client.users.cache.get(userId).tag} voted for ${vote}`)
        : e('p', { key: userId }, `${channel.client.users.cache.get(userId).tag} didn't vote for anything.`)
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
