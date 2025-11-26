// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-spec-reporter')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'lcovonly', subdir: '.', file: 'lcov.info' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['spec', 'kjhtml'],
    specReporter: {
      suppressSkipped: false,
      showSpecTiming: true,
      maxLogLines: 5,
      displayStacktrace: 'raw',
      showBrowser: true
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browserDisconnectTimeout: 50000,
    browserNoActivityTimeout: 50000,
    captureTimeout: 100000,
    autoWatch: process.env.CI === 'true' ? false : true,
    browsers: process.env.CI === 'true' ? ['ChromeHeadlessNoSandbox'] : ['ChromeHeadless'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: process.env.CI === 'true' ?
          [
            '--no-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--headless',
            '--window-size=800x600'
          ] :
          [
            '--no-sandbox', // required to run without privileges in docker
            '--user-data-dir=/tmp/chrome-test-profile',
            '--disable-web-security',
            '--disable-gpu',
            '--disable-background-networking',
            '--disable-default-apps',
            '--disable-extensions',
            '--disable-sync',
            '--disable-translate',
            '--headless',
            '--hide-scrollbars',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-first-run',
            '--safebrowsing-disable-auto-update',
            '--ignore-certificate-errors',
            '--ignore-ssl-errors',
            '--ignore-certificate-errors-spki-list',
            '--remote-debugging-port=9222',
            '--remote-debugging-address=0.0.0.0',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--disable-namespace-sandbox',
            '--window-size=800x600'
          ]
      }
    },
    singleRun: process.env.CI === 'true' ? true : false,
    restartOnFileChange: true
  });
};
