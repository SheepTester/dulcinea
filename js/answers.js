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
                const answers = []
                const start = Date.now()
                setTimeout(() => { results.set(member.id, answers); resolve() }, time)
                for(const question of memberQuestions.get(member.id)) {
                    const message = await member.send(question.replace(/_/g, '\\_'))
                    const answer = await message.channel.awaitMessages(() => true, { max: 1, time: time + start - Date.now(), errors: ['time'] }).catch(() => null)
                    if (answer) {
                        answers.push(answer.first().content)
                        answer.first().react('✅').catch(() => null)
                    } else {
                        resolve()
                    }
                }
            })
        }))
        return results
    }

    async expectVotes(time, questions, reactions) { // reactions is a list of strings to expect
        const results = new Map()
        await Promise.allSettled(this.members.map(async member => {
            return new Promise(async resolve => {
                let answer
                const message = await member.send(questions.get(member.id))
                const start = Date.now()
                setTimeout(() => { results.set(member.id, answer); resolve() }, time)
                for(;;) {
                    const ans = await message.channel.awaitMessages(mess => reactions.includes(mess.content.toLowerCase()), { max: 1, time: time + start - Date.now(), errors: ['time'] }).catch(() => null)
                    if(ans) {
                        answer = ans.first().content || answer
                        ans.first().react('✅').catch(() => null)
                    }
                    if (Date.now() > (start + time)) resolve()
                }
            })
        }))
        return results
    }
}
