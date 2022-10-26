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
  'Voting time! Reply with either `A` (left) or `B` (right).',
  'Reply with either `A` (left) or `B` (right) to vote.',
  'It\'s time to vote! Reply with either `A` (left) or `B` (right).'
]

const defaultResponses = [
  'Ugh.',
  'I don\'t know.',
  'This is too big brain for me.',
  'lol',
  'I disagree.',
  'I love you!',
  'ok',
  ':lemonthink:'
]
function autoResponse () {
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}

const questionsPromise = fetch(new URL('../questions.json', import.meta.url))
  .then(response => response.json())

function User ({ user, score = null, isAnswering = false, isDone = false, className = '' }) {
  return e(
    'div',
    {
      className: `game-player ${
        isAnswering
          ? (isDone ? 'game-done' : 'game-not-done')
          : ''
      } ${className}`
    },
    e('img', { className: 'game-avatar', src: user.avatar }),
    e('span', { className: 'game-player-name' }, user.name),
    score !== null && e(
      'span',
      { className: `game-player-score ${user.scoreChange > 0 ? 'game-player-score-changed' : ''}` },
      score
    ),
    user.scoreChange > 0 && e('span', { className: 'game-player-score-change' }, '+' + user.scoreChange)
  )
}

function Game ({ channel, onEnd, questions }) {
  const [endTime, setEndTime] = useState(null)
  const [scores, setScores] = useState([])
  const [gameState, setGameState] = useState({ type: 'answering', done: [] })

  useEffect(async () => {
    function getUser (userId) {
      const member = channel.members.get(userId) || channel.guild.members.cache.get(userId)
      return {
        id: userId,
        name: member.nickname || member.user.username,
        avatar: member.user.displayAvatarURL({
          format: 'png',
          dynamic: true,
          size: 128
        })
      }
    }

    const memberIds = shuffleInPlace(Array.from(
      channel.members
        .filter(member => !member.user.bot)
        .keys()
    ))

    const scores = new Map(memberIds.map(userId => [userId, 0])) // UserId => number
    function updateScore (oldScores) {
      setScores(
        Array.from(scores)
          .map(([userId, score]) => {
            const oldScore = oldScores && oldScores.get(userId)
            const user = {
              ...getUser(userId),
              scoreChange: oldScore !== undefined && score - oldScore
            }
            return [user, score]
          })
          .sort((a, b) => a[0].name.localeCompare(b[0].name))
      )
    }
    updateScore()

    const availableQuestions = questions
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

    setEndTime(Date.now() + 90000)
    const done = new Set()
    setGameState({ type: 'answering', done: [] })
    const answers = await answerExpecter.expectAnswers(90000, prompts, {
      onUserDone: userId => {
        done.add(userId)
        setGameState(gameState => (
          gameState.type === 'answering'
            ? { type: 'answering', done: [...done] }
            : gameState
        ))
      },
      prefix: 'Prompt: '
    })

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

    for (const [
      prompt,
      [[userA, answerA = autoResponse()], [userB, answerB = autoResponse()]]
    ] of responses) {
      setGameState({ type: 'voting', prompt, answerA, answerB, results: false })
      updateScore()
      setEndTime(Date.now() + 15000)
      const votes = await answerExpecter.expectVotes(
        15000,
        new Map(memberIds.map(userId => [userId, [voteMessages[Math.floor(Math.random() * voteMessages.length)]]])),
        ['a', 'b']
      )
      setEndTime(null)
      const oldScores = new Map(scores)
      const aVotes = []
      const bVotes = []
      for (const [userId, vote = ''] of votes) {
        if (vote.toLowerCase() === 'a') {
          aVotes.push(userId)
          scores.set(userA, scores.get(userA) + 500)
        } else if (vote.toLowerCase() === 'b') {
          bVotes.push(userId)
          scores.set(userB, scores.get(userB) + 500)
        }
      }
      updateScore(oldScores)
      setGameState({
        type: 'voting',
        prompt,
        userA: getUser(userA),
        answerA,
        aVotes: aVotes.map(getUser),
        userB: getUser(userB),
        answerB,
        bVotes: bVotes.map(getUser),
        results: true
      })
      await wait(5000)
    }
    setGameState({ type: 'scoreboard' })
  }, [onEnd])

  const sortedScores = [...scores].sort((a, b) => b[1] - a[1])
  return e(
    'div',
    {
      className: `game ${
        gameState.type === 'voting' && gameState.results
          ? 'game-voting-results'
          : ''
      }`
    },
    endTime && e(
      'p',
      { className: 'game-time-left' },
      'You have ',
      e(Timer, { endTime, className: 'game-timer big-bold' }),
      's left.'
    ),
    gameState.type === 'answering' ? e(
      // ANSWERING INSTRUCTIONS
      'div',
      { className: 'game-card game-answering-instruct' },
      e(
        'span',
        null,
        'DM ',
        e('strong', null, channel.client.user.tag),
        ' your answers!'
      )
    ) : gameState.type === 'voting' ? e(
      // VOTING CARD COMPARISON
      React.Fragment,
      null,
      e(
        'p',
        { className: 'game-prompt big-bold' },
        gameState.prompt
      ),
      e(
        'div',
        {
          className: `game-card game-vote-candidate game-left ${
            gameState.aVotes && gameState.aVotes.length > gameState.bVotes.length ? 'game-winner' : ''
          } ${
            gameState.aVotes && gameState.aVotes.length < gameState.bVotes.length ? 'game-loser' : ''
          }`
        },
        gameState.userA && e(
          User,
          { className: 'game-answer-author', user: gameState.userA }
        ),
        e('span', { className: 'game-answer' }, gameState.answerA),
        e(
          'div',
          { className: 'game-answer-voters' },
          gameState.aVotes && gameState.aVotes.map(user => e(User, { user, key: user.id }))
        )
      ),
      e(
        'div',
        {
          className: `game-card game-vote-candidate game-right ${
            gameState.aVotes && gameState.aVotes.length < gameState.bVotes.length ? 'game-winner' : ''
          } ${
            gameState.aVotes && gameState.aVotes.length > gameState.bVotes.length ? 'game-loser' : ''
          }`
        },
        gameState.userB && e(
          User,
          { className: 'game-answer-author', user: gameState.userB }
        ),
        e('span', { className: 'game-answer' }, gameState.answerB),
        e(
          'div',
          { className: 'game-answer-voters' },
          gameState.bVotes && gameState.bVotes.map(user => e(User, { user, key: user.id }))
        )
      ),
      gameState.aVotes && gameState.aVotes.length === gameState.bVotes.length && e(
        'p',
        { className: 'game-tie big-bold' },
        'Tie!'
      )
    ) : e(
      // END SCOREBOARD
      'div',
      { className: 'game-scoreboard' },
      e('h1', { className: 'game-over' }, 'Results'),
      e(
        'div',
        { className: 'game-scoreboard-wrapper' },
        e(
          'div',
          { className: 'game-scoreboard-winners' },
          sortedScores.slice(0, 3).map(([user, score], i) => e(
            'div',
            { className: `game-score game-score-rank-${i}`, key: user.id },
            e(User, { user }),
            e('span', { className: `game-score-number big-bold` }, score)
          ))
        ),
        e(
          'div',
          { className: 'game-scoreboard-losers' },
          sortedScores.slice(3).map(([user, score]) => e(
            'div',
            { className: 'game-score-insignificant', key: user.id },
            e(User, { user, score })
          ))
        )
      )
    ),
    // BOTTOM SCOREBOARD
    gameState.type !== 'scoreboard' && e(
      'div',
      { className: 'game-players' },
      scores.map(([user, score]) => e(
        User,
        {
          user,
          score,
          isAnswering: gameState.type === 'answering',
          isDone: gameState.type === 'answering' && gameState.done.includes(user.id),
          key: user.id
        }
      ))
    )
  )
}

export async function game (channel, root) {
  document.body.classList.add('screen-loading')
  const questions = await questionsPromise
  document.body.classList.remove('screen-loading')

  document.body.classList.add('screen-game')
  return new Promise(resolve => {
    ReactDOM.render(
      e(
        React.StrictMode,
        null,
        e(
          Game,
          {
            channel,
            onEnd: resolve,
            questions
          }
        )
      ),
      root
    )
  }).then(() => {
    ReactDOM.unmountComponentAtNode(root)
    document.body.classList.remove('screen-game')
  })
}
