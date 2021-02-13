const answers = new Map()

export function collectAnswer(message, voiceChannel) {
    if (message.guild || message.author.bot || !voiceChannel.members.has(message.author.id)) return
    if (answers.has(message.author.id)) {
        message.channel.send('You have already sent an answer for this round')
    } else {
        answers.set(message.author.id, message.content)
        message.channel.send('✅ Answer submitted')
    }
}

export function getAnswers() { return answers }

export function clearAnswers() { answers.clear() }