export class Answers {
    constructor(channel) {
        this.channel = channel
    }

    get members() {
        return this.channel.members.filter(m => !m.user.bot);
    }

    async expectAnswers(time) {
        const messages = await Promise.allSettled(this.members.filter.map(async member => {
            const dmChannel = await member.createDM()
            //await dmChannel.send('')
            return dmChannel.awaitMessages(() => true, { max: 1, time, errors: ['time'] }).then(messages => messages.first())
        })).then(results => results.filter(res => res.status === 'fulfilled').map(res => res.value))
        return new Map(this.members.map(m => [m.id, messages.find(mess => mess.author.id === m.id)]))
        // only returns answers for members still in vc
    }

    async expectVotes(time, reactions) { // reactions is a list of string default emojis
        const results = await Promise.allSettled(this.members.map(async member => {
            const message = await member.send(`Time to vote! React to one of the reactions below:`)
            await Promise.all(reactions.map(message.react))
            return message.awaitReactions(reaction => reactions.includes(reaction.emoji.name), { max: 1, time, errors: ['time'] })
                .then(reacts => [member.id, reacts.first().emoji.name])
                .catch(() => null)
        })).then(results => results.filter(res => res.status === 'fulfilled').map(res => res.value))
        return new Map(this.members.map(m => results.find(res => res[0] === m.id) || [m.id, null]))
    }
}