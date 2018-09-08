import * as WebSocket from 'ws';
import * as querystring from 'querystring';
import { EventEmitter } from 'events';

const WS_URL = 'wss://api.campuswire.com/v1/ws';

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

  connect() {
    let ws_url = WS_URL + '?' + querystring.stringify({
      'access_token': this.token,
      'v': '1',
    });
    let socket = new WebSocket(ws_url);
  
    socket.on('message', data => {
      let event = JSON.parse(data.toString()) as CWEvent;
      this.emit(event.event, event.data);
    });
  }
}
