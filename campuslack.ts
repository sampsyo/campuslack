import { CWClient } from './cwclient';

function forceEnv(key: string): string {
  let value = process.env[key];
  if (!value) {
    throw `set ${key}`;
  }
  return value;
}

let cw_token = forceEnv('CAMPUSWIRE_TOKEN');
let cw_groupid = forceEnv('CAMPUSWIRE_GROUP');

let client = new CWClient(cw_token);
client.connect();

client.get('user/groups').then(data => {
  console.log(data);
});

client.on('wall-post-created', data => {
  let post = data.post;
  if (post.group === cw_groupid && !post.draft) {
    let url = `https://campuswire.com/c/???/feed/${post.slug}`;

    console.log(`New ${post.type}: ${post.title}`);
    console.log(url);
    console.log(post.body);
  }
});
