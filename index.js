const SimpleNodeLogger = require('simple-node-logger');
const Rx = require('rx-lite-time');
const isOnline = require('is-online');
const fs = require('fs');

const settingsPath = './settings.json';

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

fs.exists(settingsPath, exists => {
    if (!exists) {
        return;
    }

    const settings = require(settingsPath);
    if (settings && settings.slack_webhook_url) {
        const postToSlack = require('./post-to-slack');
        postToSlack(connectivity$, connectivityTimeout, settings.slack_webhook_url);
    }
});