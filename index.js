const SimpleNodeLogger = require('simple-node-logger');
const Rx = require('rx-lite-time');
const isOnline = require('is-online');
const Slack = require('node-slackr');
const moment = require('moment');
const settings = require('./settings.json');

const log = SimpleNodeLogger.createRollingFileLogger({
    logDirectory: 'logs',
    fileNamePattern: 'errors-<DATE>.log',
    dateFormat: 'YYYY.MM.DD',
    timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
});
log.setLevel('error');

const connectivityTimeout = 5000;
const connectivity$ = Rx.Observable.interval(10000)
    .flatMap(() => isOnline({
        timeout: connectivityTimeout
    }).then(online => online));

const isOffline$ = connectivity$.filter(online => online === false);
isOffline$.subscribe(() => log.error('No Internet'));

howLongWasTheInternetDown$ = connectivity$
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

const slack = new Slack(settings.slack_webhook_url);
howLongWasTheInternetDown$.subscribe(msg => slack.notify(msg));
