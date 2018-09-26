import * as WebSocket from 'ws';
import * as querystring from 'querystring';
import * as fetch from 'node-fetch';
import { EventEmitter } from 'events';

const WS_URL = 'wss://api.campuswire.com/v1/ws';
const API_BASE = 'https://api.campuswire.com/v1/';
const RECONNECT_INTERVAL = 2000;  // Two seconds.

export interface CWEvent {
  event: string;
  data: any;
}

export class CWClient extends EventEmitter {
  constructor(
    public token: string,
    public groupIds: string[] = [],
  ) {
    super();
  }

  async reauth() {
    let res = await this.get('auth/login', {
      method: 'PUT',
      body: '{}',
    });
    this.token = res.token;
  }

  /**
   * Connect to the API's WebSocket to start emitting events.
   */
  async connect() {
    // Get a new, updated authentication token for this session.
    await this.reauth();

    let ws_url = WS_URL + '?' + querystring.stringify({
      'access_token': this.token,
      'v': '2',
    });
    let socket = new WebSocket(ws_url);

    socket.on('open', async () => {
      console.log("connected");

      // A super weird quirk of the API is that we need to "subscribe" to
      // detailed group notifications by requesting the post list. Otherwise,
      // notifications for new and updated posts won't arrive.
      for (let groupId of this.groupIds) {
        await this.get(`group/${groupId}/posts?number=20`);
      }
      console.log("subscribed");
    });

    // Receive event messages.
    socket.on('message', data => {
      let event = JSON.parse(data.toString()) as CWEvent;
      console.log("received event", event.event);
      this.emit(event.event, event.data);
    });

    // Log errors.
    socket.on('error', err => {
      console.error("socket error", err);
    });

    // Reconnect when disconnected.
    socket.on('close', (code, reason) => {
      console.log(`socket closed (${code}): ${reason}`);
      this.reconnect();
    });
  }

  /**
   * Wait for a while and then try reestablishing the connection.
   */
  reconnect() {
    setTimeout(() => {
      console.log("reconnecting");
      this.connect();
    }, RECONNECT_INTERVAL);
  }

  /**
   * Perform a request for the given path on the API and return
   * the (parsed) JSON result.
   */
  async get(path: string, options: fetch.RequestInit = {}) {
    options = Object.assign({
      headers: {
        "Authorization": "Bearer " + this.token,
        "Content-Type": "application/json",
      },
    }, options);
    let res = await fetch.default(API_BASE + path, options);
    if (!res.ok) {
      throw res.statusText;
    }
    return await res.json();
  }
}
