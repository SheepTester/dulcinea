export class Answers {
    constructor(channel) {
        this.channel = channel
    }

    async expectAnswers(time) {
        const messages = await Promise.allSettled(this.channel.members.map(async member => {
            const dmChannel = await member.createDM()
            //await dmChannel.send('')
            return dmChannel.awaitMessages(() => true, { max: 1, time, errors: ['time'] }).then(messages => messages.first())
        })).then(results => results.filter(res => res.status === 'fulfilled').map(res => res.value))
        return new Map(this.channel.members.map(m => [m.id, messages.find(mess => mess.author.id === m.id)]))
        // only returns answers for members still in vc
    }
}