import { CWClient } from './cwclient';

function forceEnv(key: string): string {
  let value = process.env[key];
  if (!value) {
    throw `set ${key}`;
  }
  return value;
}

async function main() {
  let cw_token = forceEnv('CAMPUSWIRE_TOKEN');
  let cw_groupid = forceEnv('CAMPUSWIRE_GROUP');

  let client = new CWClient(cw_token);

  // Load the available groups (i.e., classes).
  let groupList = await client.get('user/groups');
  let groups: {[key: string]: any} = {};
  for (let group of groupList) {
    groups[group.id] = group;
  }

  client.connect();

  client.on('wall-post-created', data => {
    let post = data.post;
    if (post.group === cw_groupid && !post.draft) {
      let courseSlug = groups[cw_groupid].slug;
      let url = `https://campuswire.com/c/${courseSlug}/feed/${post.slug}`;

      console.log(`New ${post.type}: ${post.title}`);
      console.log(url);
      console.log(post.body);
    }
  });
}

main();
