import { CWClient } from './cwclient';
import fetch from 'node-fetch';

function forceEnv(key: string): string {
  let value = process.env[key];
  if (!value) {
    throw `set ${key}`;
  }
  return value;
}

/**
 * Send a JSON payload to a Slack Incoming Webhook URL.
 */
async function slackHook(url: string, data: any) {
  let res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    console.error(`Slack hook error: ${res.statusText}`);
  }
}

async function main() {
  let cw_token = forceEnv('CAMPUSWIRE_TOKEN');
  let cw_groupid = forceEnv('CAMPUSWIRE_GROUP');
  let slack_hookurl = forceEnv('SLACK_HOOK_URL');

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

      // Craft a message to post to Slack.
      let message = `New ${post.type}: ${post.title}\n`;
      message += url + '\n';
      message += post.body;

      // Send the message.
      console.log(message);
      slackHook(slack_hookurl, {
        text: message,
      });
    }
  });
}

main();
