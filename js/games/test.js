import { Answers } from '../answers.js'
import { wait, shuffleInPlace } from '../utils.js'
import { Timer } from '../timer.js'

const { createElement: e, useEffect, useState } = React

const emoji = []
// Add regional indicators A-Z
for (let i = 0x1f1e6; i <= 0x1f1ff; i++) {
  emoji.push(String.fromCodePoint(i))
}

const voteMessages = [
  'Voting time! Reply with either `A` or `B`.',
  'Reply with either `A` or `B` to vote.',
  'It\'s time to vote! Reply with either `A` or `B`.'
]

const defaultResponses = [
  'Ugh.',
  'I don\'t know.',
  'This is too big brain for me.',
  'lol',
  'I disagree.'
]
function autoResponse () {
  return defaultResponses[Math.random() * defaultResponses | 0]
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
    const scores = new Map(memberIds.map(userId => [userId, 0])) // UserId => number
    const prompts = new Map(memberIds.map(userId => [userId, []])) // UserId => Question[]
    for (let i = 0; i < memberIds.length; i++) {
      const [prompt] = questions.splice(Math.floor(Math.random() * questions.length), 1)
      if (i === 0) {
        prompts.get(memberIds[0]).push(prompt)
        prompts.get(memberIds[memberIds.length - 1]).push(prompt)
      } else {
        prompts.get(memberIds[i]).push(prompt)
        prompts.get(memberIds[i - 1]).push(prompt)
      }
    }

    const answerExpecter = new Answers(channel)

    setEndTime(Date.now() + 10000)
    const answers = await answerExpecter.expectAnswers(10000, prompts)
    setAnswers(Array.from(answers.entries()))

    const responses = new Map() // Question => [UserId, string][]
    for (const [userId, userPrompts] of prompts) {
      const userAnswers = answers.get(userId) || []
      for (let i = 0; i < userPrompts.length; i++) {
        const prompt = userPrompts[i]
        const answer = userAnswers[i]
        let promptResponses = responses.get(prompt)
        if (!promptResponses) {
          promptResponses = []
          responses.set(prompt, promptResponses)
        }
        promptResponses.push([userId, answer])
      }
    }

    console.log(responses)
    for (const [
      prompt,
      [[userA, answerA = autoResponse()], [userB, answerB = autoResponse()]]
    ] of responses) {
      console.log(prompt, userA, answerA, userB, answerB)
      setEndTime(Date.now() + 10000)
      const votes = await answerExpecter.expectAnswers(
        10000,
        new Map(memberIds.map(userId => [userId, [voteMessages[Math.random() * voteMessages.length | 0]]]))
      )
      setEndTime(null)
      for (const [vote = ''] of votes.values()) {
        if (vote.toLowerCase() === 'a') {
          scores.set(userA, scores.get(userA) + 500)
        } else if (vote.toLowerCase() === 'b') {
          scores.set(userB, scores.get(userB) + 500)
        }
      }
      console.log(scores)
      await wait(10000)
    }
    // onEnd()
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
        ? e('p', { key: userId }, `${channel.client.users.cache.get(userId).tag} says, "${message.join(', ')}"`)
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
