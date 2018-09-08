import { CWClient } from './cwclient';

let cw_token = process.env['CAMPUSWIRE_TOKEN'];
if (!cw_token) {
  throw "set CAMPUSWIRE_TOKEN";
}
let client = new CWClient(cw_token);
client.connect();

client.on('wall-post-created', data => {
  let post = data.post;
  if (!post.draft) {
    console.log(post.title);
    console.log(post.group);
    console.log(post.body);
    console.log(post.note);
    console.log(post);
  }
});
