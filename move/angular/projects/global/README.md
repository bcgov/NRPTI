# global

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.2.0.

## Code scaffolding

Run `ng generate component component-name --project global` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project global`.
> Note: Don't forget to add `--project global` or else it will be added to the default project in your `angular.json` file.

## Build

Run `ng build global` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build global`, go to the dist folder `cd dist/global` and run `npm publish`.

## Configuration Service

This is used to configure each Angular SPA either at build-time or run-time.

- build-time configuration of which API hostname each respective Angular front-end should be pointing at
- run-time configuration of which API hostname each respective Angular front-end should be pointing at
- run-time enabling/disabling of product features in the Angular App

There are two configurable parts to this implementation, each front-end has it's own configurable environment (public-nrpti, admin-nrpti, public-lng)

1. The Angular environment has a default set of environment variables injected into `window.__env` via the `env.js` file which can be manipulated at build time.  Devops can target these files to fine-tune their own needs without code changes.
2. There is an API call that blocks the Angular SPA at an `APP_INITIALIZER` provider, calling a relative URL to its served domain name, adding `/config` and calling an HTTP GET against it.  If this returns 200 OK with valid JSON, it will set the configuration object in the config service to the JSON in the response.  If in the case of failure (HTTP 400/404/500 etc) it will fall-back to what was baked into the env.js file, which should be a valid fall-back JSON.  In either case, after success/failure of the Javascript Promise, the config service is now set with a configuration that the api services (or any other part of the Angular app) can use to make a network call to the appropriate API server for that environment.  The benefit of this is that an API service could be backing this endpoint and all configuration data could be driven by either environment variables in the service, or database driven.

The current approach in the API is to be environment variable driven, see `protectedGetConfig` in `config.js` below.  All environments need to have the appropriate environment variables set so that the API can serve out the correct config for each dev/test/prod Angular app.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
