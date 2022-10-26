class ClientError extends Error {
  constructor(message) {
    super(message);
  }
}

export class CannotConnectError extends ClientError {
  constructor() {
    super('Cannot Connect because something else is already connected');
  }
}

export class HTTPError extends ClientError {
  constructor(message, code) {
    super(`CODE: ${code}\nMESSAGE: ${message}`);
  }
}

export default class Client {
  constructor() {
    this.token = '';
    this.base_url = '';
    this.client_id = '';
  }

  initialize(token, port) {
    this.token = token;
    this.base_url = `http://localhost:${port}`;
    this.client_id = '';
  }

  async connect() {
    const response = await fetch(`${this.base_url}/connect`, {
      method: 'POST',
      body: this.token,
    });

    if (response.status === 503)
      // Server is currently hosting another bot
      throw new CannotConnectError();

    if (!response.ok) throw new HTTPError(response.message, response.status);

    this.client_id = await response.text();
  }

  async disconnect() {
    const response = await fetch(`${this.base_url}/disconnect`, {
      method: 'POST',
    });

    if (!response.ok) throw new HTTPError(response.message, response.status);
  }
}
