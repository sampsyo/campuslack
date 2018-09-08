import * as WebSocket from 'ws';
import * as querystring from 'querystring';

const WS_URL = 'wss://api.campuswire.com/v1/ws';

class CWClient {
  constructor(
    public token: string
  ) {}

  connect() {
    let ws_url = WS_URL + '?' + querystring.stringify({
      'access_token': this.token,
      'v': '1',
    });
    let socket = new WebSocket(ws_url);
  
    socket.on('message', data => {
      let msg = JSON.parse(data.toString());
      console.log(msg);
    });
  }
}

let cw_token = process.env['CAMPUSWIRE_TOKEN'];
if (!cw_token) {
  throw "set CAMPUSWIRE_TOKEN";
}
let client = new CWClient(cw_token);
client.connect();
