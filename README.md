# Offline Reporter
A node module that periodically checks for an internet connection and logs any downtime it detects.

When the connection is re-established it calculates how long it was down and sends a message to a Slack channel.

To ensure the program runs after you left the shell use:

    nohup node index.js &
