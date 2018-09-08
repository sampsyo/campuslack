import * as WebSocket from 'ws';
import * as querystring from 'querystring';

const WS_URL = 'wss://api.campuswire.com/v1/ws';

function connect(token: string) {
  let ws_url = WS_URL + '?' + querystring.stringify({
    'access_token': token,
    'v': '1',
  });
  let socket = new WebSocket(ws_url);

  socket.on('message', data => {
    let msg = JSON.parse(data.toString());
    console.log(msg);
  });
}

connect(process.argv[2]);