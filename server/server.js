const TOKEN = process.env['TOKEN']; // Get TOKEN
const express = require('express');
const cors = require('cors');
const TetLib = require('./TetLib');

// Load bazaar name conversions
const config = require('./config');

const info = (message) => {
  console.log(`\u001b[36m[INFO]\u001b[m: ${message}`);
};

const error = (message) => {
  console.log(`\u001b[31m[ERROR]\u001b[m: ${message}`);
};

const app = express();

let currentToken = '';
let currentDiscord = '';
let currentlyConnected = false;

app.use(cors());

app.post('/connect', (req, res) => {
  if (currentlyConnected) {
    error('Website attempting to connect, refusing connection');
    res.statusCode(503);
    res.send('Already connected to game, disconnect to allow connection');
    return;
  }

  currentToken = TetLib.genID(10);

  info('Accepted website attempt to connect, initializing discord client');

  // TODO: Discord stuff
  info('initialized discord client, sending auth key to website');
  res.send(currentToken);
});

app.listen(config.port, () => {
  info(`Server Started on port ${config.port}`);
});
