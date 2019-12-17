# bcgov/nrpti/api

API for the Natural Resources Public Transparency Interface (NRPTI).

* [api](https://github.com/bcgov/nrpti/api) - back-end that serves all admin and public requests.

# Prerequisites

| Technology | Version | Website                                     | Description                               |
|------------|---------|---------------------------------------------|-------------------------------------------|
| node       | 10.x.x  | https://nodejs.org/en/                      | JavaScript Runtime                        |
| npm        | 6.x.x   | https://www.npmjs.com/                      | Node Package Manager                      |
| yarn       | latest  | https://yarnpkg.com/en/                     | Package Manager (more efficient than npm) |
| mongodb    | 3.4+    | https://docs.mongodb.com/v3.2/installation/ | NoSQL database                            |

## Install [Node + NPM](https://nodejs.org/en/)

_Note: Windows users can use [NVM Windows](https://github.com/coreybutler/nvm-windows) to install and manage multiple versions of Node+Npm._

## Install [Yarn](https://yarnpkg.com/lang/en/docs/install/#alternatives-tab)

```
npm install -g yarn
```

## Install [MongoDB](https://docs.mongodb.com/v3.2/installation/)

# Build and Run

1. Download dependencies
```
yarn install
```
2. Run the app
```
npm start
```
3. Go to http://localhost:3000/api/docs to verify that the application is running.

    _Note: To change the default port edit `swagger.yaml`._

# Linting and Formatting

## Info

Linting and formatting is handled by a combiation of `TSlint` and `Prettier`.  The reason for this, is that you get the best of both worlds: TSlint's larger selection of linting rules with Prettier's robust formatting rules.

These 2 linters (tslint, Prettier) do have overlapping rules.  To avoid weird rule interactions, TSlint has been configured to defer any overlapping rules to Prettier, via the use of `tslint-config-prettier` in `tslint.json`.

### Technolgies used

[TSLint](https://palantir.github.io/tslint/), [Prettier](https://prettier.io/), [Stylelint](https://stylelint.io/)

### Configuration files

* ESlint: eslint.json
* Prettier: .prettierrc .prettierignore
* lint-staged: package.json

## Run Linters

* Lint the `*.js` files using `ESLint`.
```
npm run lint
```

## Run Linters + Formatters

_Note: In the worst case scenario, where linting/formatting has been neglected, then these `lint-fix` commands have the potential to create 100's of file changes.  In this case, it is recommended to only run these commands as part of a separate commit._

_Note: Not all linting/formatting errors can be automatically fixed, and will require human intervention._

* Lint and fix the `*.js` files using `ESLint` + `Prettier`.

```
npm run lint-fix
```

# API Specification

The API is defined in `swagger.yaml`.

If this project is running locally, you can view the api docs at: `http://localhost:3000/api/docs/`

This project uses npm package `swagger-tools` via `./app.js` to automatically generate the express server and its routes, based on the contents of `swagger.yaml`.

Useful Note: The handler function for each route is specified by the `operationId` field.

Recommend reviewing the [Open API Specification](https://swagger.io/docs/specification/about/) before making any changes to the `swagger.yaml` file.

 - Updates to the swagger may require updates to the mock handlers in the test files.  See section on API testing below.

# Logging

A centralized logger has been created (see `api/utils/logger.js`).

## Logger configuration
The loggers log level can be configured via an environment variable: `LOG_LEVEL`

Set this variable to one of: `error`, `warn`, `info`, `debug`

Default value: `info`

## Instantiating the logger in your class/file
```
const log = require('./logger)('a meaningful label, typically the class name`)
```

## Using the logger
```
log.error('Used when logging unexpected errors.  Generally these will only exist in catch() blocks');

log.warn('Used when logging soft errors.  For example, if your request finished but returned a 404 not found');

log.info('General log messages about the state of the application');

log.debug('Useful for logging objects and other developer data', JSON.stringify(myObject));
```

# Testing

## Info

This project contains two kinds of unit tests.  Regular unit tests and API unit tests, which require some special considerations and setup, as detailed in the API Testing section below.

### Technolgies used

[Jest](jasmine), [SuperTest](https://www.npmjs.com/package/supertest), [Nock](https://www.npmjs.com/package/nock), [Mongodb-Memory-Server](https://www.npmjs.com/package/mongodb-memory-server)

## Run Tests

* Run the unit and api tests.
  * Note: the `package.json` `tests` command sets the `UPLOAD_DIRECTORY` environment variable, the command for which may be OS specific and therefore may need adjusting depending on your machines OS.

```
npm run tests
```


## API Tests

This project is using [jest](http://jestjs.io/) as a testing framework. You can run tests with
`yarn test` or `jest`. Running either command with the `--watch` flag will re-run the tests every time a file is changed.

To run the tests in one file, simply pass the path of the file name e.g. `jest api/test/search.test.js --watch`. To run only one test in that file, chain the `.only` command e.g. `test.only("Search returns results", () => {})`.

The **_MOST IMPORTANT_** thing to know about this project's test environment is the router setup. At the time of writing this, it wasn't possible to get [swagger-tools](https://github.com/apigee-127/swagger-tools) router working in the test environment. As a result, all tests **_COMPLETELY bypass_ the real life swagger-tools router**. Instead, a middleware router called [supertest](https://github.com/visionmedia/supertest) is used to map routes to controller actions. In each controller test, you will need to add code like the following:

```javascript
const testUtils = require('./testUtils');
const app = testUtils.app;
const documentController = require('../controllers/documentController.js');
const fieldNames = ['tags', 'properties', 'applicationID'];

app.get('/api/document/:id', function(req, res) {
  let params = testUtils.buildParams({'documentId': req.params.id});
  let paramsWithDocumentId = testUtils.createPublicSwaggerParams(fieldNames, params);
  return documentController.protectedGet(paramsWithDocumentId, res);
});

test("GET /api/document/:id  returns 200", done => {
  request(app)
    .get('/api/document/AAABBB')
    .expect(200)
    .then(done)
});
```

This code will stand in for the swagger-tools router, and help build the objects that swagger-tools magically generates when HTTP calls go through it's router. The above code will send an object like below to the `api/controllers/documentController.js` controller `protectedGet` function as the first parameter (typically called `args`).

```javascript
{
  swagger: {
    params: {
      auth_payload: {
        scopes: ['sysadmin', 'public'],
        userID: null
      },
      fields: {
        value: ['tags', 'properties', 'applicationID']
      },
      documentId: {
        value: 'AAABBB'
      }
    }
  }
}
```

Unfortunately, this results in a lot of boilerplate code in each of the controller tests. There are some helpers to reduce the amount you need to write, but you will still need to check the parameter field names sent by your middleware router match what the controller(and swagger router) expect. However, this method results in  pretty effective integration tests as they exercise the controller code and save objects in the database.


### Test Database
The tests run on an in-memory MongoDB server, using the [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server) package. The setup can be viewed at [testUtils.js](api/test/testUtils.js), and additional config in [config/mongoose_options.js]. It is currently configured to wipe out the database after each test run to prevent database pollution.

[Factory-Girl](https://github.com/aexmachina/factory-girl) is used to easily create models(persisted to db) for testing purposes.

### Mocking http requests
External http calls (such as GETs to BCGW) are mocked with a tool called [nock](https://github.com/nock/nock). Currently sample JSON responses are stored in the [test/fixtures](test/fixtures) directory. This allows you to intercept a call to an external service such as bcgw, and respond with your own sample data.

```javascript
  const bcgwDomain = 'https://openmaps.gov.bc.ca';
  const searchPath = '/geo/pub/FOOO';
  const crownlandsResponse = require('./fixtures/crownlands_response.json');
  let bcgw = nock(bcgwDomain);
  let dispositionId = 666666;

  beforeEach(() => {
    bcgw.get(searchPath + urlEncodedDispositionId)
      .reply(200, crownlandsResponse);
  });

  test('returns the document data from bcgw', done => {
    request(app).get('/api/public/search/bcgw/dispositionTransactionId/' + dispositionId)
      .expect(200)
      .then(response => {
        let firstDocument = response.body.document[0];
        expect(firstDocument).toHaveProperty('properties');
        expect(firstDocument.properties).toHaveProperty('DISPOSITION_TRANSACTION_SID');
        done();
      });
  });
```
`
### Keycloak

This project uses [Keycloak](https://www.keycloak.org/) to handle authentication and manage user roles.
