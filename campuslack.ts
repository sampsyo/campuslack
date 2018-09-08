import { CWClient } from './cwclient';

function forceEnv(key: string): string {
  let value = process.env[key];
  if (!value) {
    throw "set ${key}";
  }
  return value;
}

let cw_token = forceEnv('CAMPUSWIRE_TOKEN');
let cw_groupid = forceEnv('CAMPUSWIRE_GROUP');

let client = new CWClient(cw_token);
client.connect();

client.on('wall-post-created', data => {
  let post = data.post;
  if (post.group === cw_groupid && !post.draft) {
    console.log(post.title);
    console.log(post.group);
    console.log(post.body);
    console.log(post.type);
    console.log(post);
  }
});
