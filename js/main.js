import { getToken } from './token.js'

const client = new Discord.Client()

async function main () {
  client.on('ready', () => {
    console.log(client)
  })

  const tokenForm = document.getElementById('token-form')
  const token = await getToken({
    storageKey: '[discordjackbox] bot token',
    form: tokenForm,
    input: document.getElementById('token-input'),
    saveCheckbox: document.getElementById('token-save')
  })
  tokenForm.remove()
  await client.login(token)
}

main()
