import { getToken } from './token.js'
import { renderVoiceChannelList } from './voice-list.js'

const client = new Discord.Client()
window.client = client

async function main () {
  document.body.classList.remove('screen-loading')
  document.body.classList.add('screen-token')
  const tokenForm = document.getElementById('token-form')
  const token = await getToken({
    storageKey: '[discordjackbox] bot token',
    form: tokenForm,
    input: document.getElementById('token-input'),
    saveCheckbox: document.getElementById('token-save')
  })
  tokenForm.remove()
  document.body.classList.remove('screen-token')
  document.body.classList.add('screen-loading')
  client.login(token)
  // Await the ready event
  await new Promise(resolve => {
    client.once('ready', resolve)
  })

  document.body.classList.remove('screen-loading')
  document.body.classList.add('screen-vc')
  const vcListWrapper = document.getElementById('vc-list')
  const { wrapper: vcList, select: vcSelect } = renderVoiceChannelList(client)
  vcListWrapper.append(vcList)
  const channel = await vcSelect
  vcListWrapper.remove()
  document.body.classList.remove('screen-vc')
  document.body.classList.add('screen-loading')

  console.log(channel)
}

main()
