import { getToken } from './token.js'

getToken({
  storageKey: '[discordjackbox] bot token',
  form: document.getElementById('token-form'),
  input: document.getElementById('token-input'),
  saveCheckbox: document.getElementById('token-save')
}).then(token => {
  document.getElementById('token-form').remove()
})
