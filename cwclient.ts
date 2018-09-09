import * as WebSocket from 'ws';
import * as querystring from 'querystring';
import fetch from 'node-fetch';
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
    public token: string
  ) {
    super();
  }

  /**
   * Connect to the API's WebSocket to start emitting events.
   */
  connect() {
    let ws_url = WS_URL + '?' + querystring.stringify({
      'access_token': this.token,
      'v': '1',
    });
    let socket = new WebSocket(ws_url);

    socket.on('open', () => {
      console.log("connected");
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
      setTimeout(() => {
        console.log("reconnecting");
        this.connect();
      }, RECONNECT_INTERVAL);
    });
  }

  /**
   * Perform a GET request for the given path on the API and return
   * the (parsed) JSON result.
   */
  async get(path: string) {
    let res = await fetch(API_BASE + path, {
      headers: {
        "Authorization": "Bearer " + this.token,
      },
    });
    if (!res.ok) {
      throw res.statusText;
    }
    return await res.json();
  }
}
