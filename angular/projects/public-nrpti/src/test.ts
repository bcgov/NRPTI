// This file is required by karma.conf.js and loads recursively all the .spec and framework files

// import 'zone.js/long-stack-trace-zone';
// import 'zone.js/proxy.js';
// import 'zone.js/sync-test';
// import 'zone.js/jasmine-patch';
// import 'zone.js/async-test';
// import 'zone.js/fake-async-test';
import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

// Unfortunately there's no typing for the `__karma__` variable. Just declare it as any.
declare const __karma__: any;
declare const require: any;

// Prevent Karma from running prematurely.
__karma__.loaded = () => {};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

__karma__.start();
