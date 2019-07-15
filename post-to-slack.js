const { IncomingWebhook } = require('@slack/webhook');
const moment = require('moment');

function postToSlack(connectivity$, connectivityTimeout, slackWebhookUrl) {
    let howLongWasTheInternetDown$ = connectivity$
        .distinctUntilChanged(online => online === false)
        .skip(1) // first element comes when the program starts (prevents a false alert)
        .timeInterval()
        .filter(connectivityChanged => connectivityChanged.value === true)
        .map(connectivityChanged => connectivityChanged.interval)
        .map(interval => moment.duration(interval))
        .map(duration => duration.add(connectivityTimeout, 'ms'))
        .map(duration => duration.as('seconds'))
        .map(duration => Math.round(duration) + ' seconds')
        .map(txtDuration => 'Internet was down for ' + txtDuration + ' :unamused:');

    const slack = new IncomingWebhook(slackWebhookUrl);
    howLongWasTheInternetDown$.subscribe(msg => slack.send(msg));
}

module.exports = postToSlack;