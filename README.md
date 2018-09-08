Campuswire to Slack
===================

A little connector to send new [Campuswire][] posts to a [Slack][] channel.

To set up, type:

    $ yarn
    $ yarn run tsc

Then, set these environment variables:

* `CAMPUSWIRE_TOKEN`: The Campuswire authorization token, which you can get from a browser session.
* `CAMPUSWIRE_GROUP`: The GUID-like ID of the Campuswire group (i.e., class) you want to watch.
* `SLACK_HOOK_URL`: The URL for a Slack [Incoming Webhook][iwh] that we'll use to post our messages.

Then run the tool:

    $ node build/campuslack.js

This is by [Adrian Sampson][adrian]. The license is [MIT][].

[campuswire]: https://campuswire.com
[slack]: https://slack.com
[iwh]: https://api.slack.com/incoming-webhooks#advanced_message_formatting
[adrian]: https://www.cs.cornell.edu/~asampson/
[mit]: https://opensource.org/licenses/MIT
