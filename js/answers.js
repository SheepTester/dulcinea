const answeredUsers = []

function answerKey(userID) {
    return `[discordjackbox] answer: ${userID}`
}

export function collectAnswer(message, voiceChannel) {
    if (!voiceChannel.members.has(message.author.id)) return

    answeredUsers.push(message.author.id)
    const key = answerKey(message.author.id)

    if (!localStorage.getItem(key)) {
        localStorage.setItem(key, message.content)
        return true
    } else {
        return false
    }
}

export function getAnswers() {
    return new Map(answeredUsers.map(userID => [userID, localStorage.getItem(answerKey(userID))]))
}

export function clearAnswers() {
    answeredUsers.forEach(userID => localStorage.removeItem(answerKey(userID)))
    answeredUsers = []
}