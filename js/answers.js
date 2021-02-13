const answers = new Map()

export async function expectAnswers(channel, time) {
    const messages = await Promise.allSettled(channel.members.map(async member => {
        const dmChannel = await member.createDM()
        //await dmChannel.send('')
        return dmChannel.awaitMessages(() => true, { max: 1, time, errors: ['time'] }).then(messages => messages.first())
    })).then(results => results.filter(res => res.status === 'fulfilled').map(res => res.value))
    return new Map(channel.members.map(m => [m.id, messages.find(mess => mess.author.id === m.id)])) // only returns answers for members still in vc
}

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