export class Answers {
    constructor(channel) {
        this.channel = channel
    }

    get members() {
        return this.channel.members.filter(m => !m.user.bot);
    }

    async expectAnswers(time, memberQuestions) {
        const results = new Map()
        await Promise.allSettled(this.members.map(async member => {
            return new Promise(async resolve => {
                const answers = [];
                const start = Date.now()
                setTimeout(() => { results.set(member.id, answers); resolve() }, time)
                for(const question of memberQuestions.get(member.id)) {
                    const message = await member.send(question)
                    const answer = await message.channel.awaitMessages(() => true, { max: 1, time: time + start - Date.now(), errors: ['time'] }).catch(() => null)
                    if (answer) answers.push(answer.first().content)
                    else resolve()
                }
            })
        }))
        return results
    }

    async expectVotes(time, reactions) { // reactions is a list of string default emojis
        const results = await Promise.allSettled(this.members.map(async member => {
            const message = await member.send(`Time to vote! React to one of the reactions below:`)
            await Promise.all(reactions.map(e => message.react(e).catch(() => null)))
            return message.awaitReactions(reaction => reactions.includes(reaction.emoji.name), { max: 1, time, errors: ['time'] })
                .then(reacts => [member.id, reacts.first().emoji.name])
                .catch(() => null)
        })).then(results => results.filter(res => res.status === 'fulfilled').map(res => res.value))
        return new Map(this.members.map(m => results.find(res => res[0] === m.id) || [m.id, null]))
    }
}
