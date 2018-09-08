import * as WebSocket from 'ws';
import * as querystring from 'querystring';
import { EventEmitter } from 'events';

const WS_URL = 'wss://api.campuswire.com/v1/ws';

interface CWEvent {
  event: string;
  data: any;
}

class CWClient extends EventEmitter {
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
      console.log(event);

      if (event.event === 'message') {
        this.emit('message', event.data);
      }
    });
  }
}

let cw_token = process.env['CAMPUSWIRE_TOKEN'];
if (!cw_token) {
  throw "set CAMPUSWIRE_TOKEN";
}
let client = new CWClient(cw_token);
client.on('message', data => {
  console.log(data.groupId);
  console.log(data.message.body);
});
client.connect();
