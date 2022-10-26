import { getToken } from './token.js';
import { selectVoiceChannel } from './voice-list.js';

import Client, { CannotConnectError } from './discord/server_client.js';

import { game } from './games/test.js';

const client = new Client();
window.client = client;

async function main() {
  document.body.classList.remove('screen-loading');
  document.body.classList.add('screen-token');
  const tokenForm = document.getElementById('token-form');
  const inputs = await getToken({
    storageKeys: {
      token: '[discordjackbox] bot token',
      port: '[discordjackbox] server port',
    },
    form: tokenForm,
    inputs: {
      token: document.getElementById('token-input'),
      port: document.getElementById('port-input'),
    },
    saveCheckbox: document.getElementById('token-save'),
  });
  tokenForm.remove();
  document.body.classList.remove('screen-token');
  document.body.classList.add('screen-loading');
  // something something funni yayayay
  client.initialize(inputs.token, token.port);
  try {
    // Await the ready event
    await client.connect();
  } catch (e) {
    // TODO: Implement checks to see if it was that the server was busy and mald at the user if so
    await client.disconnect();
    await client.connect();
  }

  document.body.classList.remove('screen-loading');
  document.body.classList.add('screen-vc');
  const channel = await selectVoiceChannel(
    client,
    document.getElementById('vc-list')
  );
  document.body.classList.remove('screen-vc');

  // Keep playing the game
  document.body.classList.add('screen-game');
  await game(channel, document.getElementById('game-root'));
  document.body.classList.remove('screen-game');
  document.body.classList.add('screen-loading');
}

main();
