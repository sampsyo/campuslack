import { CWClient } from './cwclient';
import fetch from 'node-fetch';

const MAX_MESSAGE_LENGTH = 256;

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

  let client = new CWClient(cw_token, [cw_groupid]);

  // Load the available groups (i.e., classes).
  let groupList = await client.get('user/groups');
  let groups: {[key: string]: any} = {};
  for (let group of groupList) {
    groups[group.id] = group;
  }

  // Load the users.
  let users = await client.get('network/users/connected');

  client.connect();

  client.on('wall-post-created', data => {
    let post = data.post;
    if (post.group === cw_groupid && !post.draft) {
      let group = groups[cw_groupid];

      // Construct the link to the new post.
      let courseSlug = group.slug;
      let url = `https://campuswire.com/c/${courseSlug}/feed/${post.slug}`;
      console.log(url);

      // Truncate the message.
      let body: string = post.body;
      if (body.length > MAX_MESSAGE_LENGTH) {
        body = body.slice(0, MAX_MESSAGE_LENGTH) + "…";
      }

      // Create the Slack attachment.
      let attach: {[key: string]: any} = {
        fallback: `New ${post.type}: ${post.title}\n${url}`,
        title: post.title,
        title_link: url,
        text: body,
        ts: Date.parse(post.createdAt) / 1000,
        footer: group.name,
        footer_icon: group.photo,
      };

      // Try to look up the author.
      let user = users[post.author];
      if (user) {
        attach['author_name'] = `${user.firstName} ${user.lastName}`;
        attach['author_icon'] = user.photo;
      }

      // Post a message to Slack.
      slackHook(slack_hookurl, { attachments: [attach] });
    }
  });
}

main();
