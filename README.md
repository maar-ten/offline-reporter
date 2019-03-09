# Offline Reporter
A node module that periodically checks for an internet connection and logs any downtime it detects.

When the connection is re-established it calculates how long it was down and sends a message to a Slack channel.
For this to work the program needs a settings.json file with a the url of the webhook:

    { "slack_webhook_url" : "https://hooks.slack.com/services/<your_channel_webhook>" }
     
To ensure the program runs after you left the shell use:

    nohup node index.js &
