# bcgov/nrpti/api

API for the Natural Resources Public Transparency Interface (NRPTI).

* [api](https://github.com/bcgov/nrpti/api) - back-end that serves all admin and public requests.

# Running with Docker

Run using the command `docker-compose up` to begin building and running the `api`

# Running Locally without Docker

| Technology | Version         | Website                                     | Description                               |
|------------|-----------------|---------------------------------------------|-------------------------------------------|
| node       | 18.17.0         | https://nodejs.org/en/                      | JavaScript Runtime                        |
| npm        | latest          | https://www.npmjs.com/                      | Node Package Manager                      |
| yarn       | latest          | https://yarnpkg.com/en/                     | Package Manager (more efficient than npm) |
| mongodb    | 3.4 - 3.6       | https://docs.mongodb.com/v3.6/installation/ | NoSQL database                            |

## Install [NodeJS](https://nodejs.org/en/blog/release/v18.17.0)

_Note: NVM can be used to install and manage multiple versions of NodeJS and npm ([Windows version]((https://github.com/coreybutler/nvm-windows)), [Unix / Linux / macOS version](https://github.com/nvm-sh/nvm))._

## Install [MongoDB](https://docs.mongodb.com/v3.6/installation/)

# Build and Run

1. Download dependencies
```
npm install
```
2. Start MongoDB
```
brew services start mongodb-community@3.6
```
3. Run the migrations locally
```
db-migrate up -e local
```
> _Note: you may need to adjust Minio env variables, or skip the loadMemDocs migration_
4. Run the app
```
npm start
```
5. Go to http://localhost:3000/api/docs to verify that the application is running.

>_Note: To change the default port edit `swagger.yaml`._

# Linting and Formatting

## Info

Linting and formatting is handled by a combiation of `ESLint` and `Prettier`.  The reason for this, is that you get the best of both worlds: ESLint's larger selection of linting rules with Prettier's robust formatting rules.

These 2 linters (ESLint, Prettier) do have overlapping rules.  To avoid weird rule interactions, ESLint has been configured to defer any overlapping rules to Prettier, via the use of `eslint-config-prettier`.

### Technolgies used

[ESLint](https://ESLint.org/), [Prettier](https://prettier.io/)

### Configuration files

* ESLint: eslint.json
* Prettier: .prettierrc .prettierignore

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
npm run test
```

Run individual test suites using the relative command. For example:

```
npm run test api/src/importers/alc/base-record-utils.test.js
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

### Keycloak

This project uses [Keycloak](https://www.keycloak.org/) to handle authentication and manage user roles.

# Records

## sourceSystemRef
Each record has an attribute called sourceSystemRef. The source system references where a record has been imported/uploaded from into NRPTI. These are the different sources:

- `nrpti`
- `nris-epd`
  - Imported from Ministry of Environment and Climate Change Strategy (Formerly Environmental Protection Division (EPD))
- `nris-emli`
  - Imported from Energy, Mines and Low Carbon Innovation (EMLI)
- `epic`
  - Imported from Environmental Assessments in British Columbia's EPIC application.
- `core`
  - Imported from EMLI's CORE application.
- `bcogc`
  - Imported from BC Energy Regulator (formerly BC Oil and Gas Commission (BCOGC))
- `bcogc-csv`
  - Imported as a CSV from BC Energy Regulator (formerly BC Oil and Gas Commission (BCOGC))
- `ocers-csv`
  - Imported from Online Compliance and Enforcement Reporting System (OCERS)
- `lng-csv`
  - Imported as a CSV from from BC Energy Regulator (formerly Liquefied natural gas (LNG)) 
- `agri-mis-csv`
  - Imported as a CSV from the Ministry of Agriculture and Food (AGRI)
- `agri-cmdb-csv`
  - Imported as a CSV from the Ministry of Agriculture and Food (AGRI)
- `nris-flnr-csv`
  - Imporated as a CSV from the Ministry of Forests (NRIS-FLNRO)
- `coors-csv`
  - Imported as a CSV from the Conservation Officer Online Reporting (COORS).
- `era-csv`
  - Imported as a CSV from the Natural Resource Office: The Enforcement Action, Administrative Review
and Appeal Tracking System  (NRO-ERA) 
- `ams-csv`
  - Imported as a CSV from the Authorize Management System (AMS) 
- `alc-csv`
  - Imported as a CSV from the Agricultural Land Commission (ALC) 
- `mem-admin`


# Setting up Legislation data dynamic updates

The names of the agencies and the legislation that is attached to records can change. All acts and associated regulations are mapped out in the act-regulations-mapping collection in the database. BCLaws hosts an API that returns a current act name (and other data) from consistent endpoints.  

To make it so act names are automatically checked against this API and updated as needed, you need two pieces of information : 

 - 1. actCode : Every record in the act-regulations-mapping collection in the DB has a unique actCode that is mapped to actual legislation values (actName and regulations). You need the actCode that is mapped to whatever actName you are working on. (Example actCode : ‘ACT_103’ ) 

 - 2. BCLaws-API-URL: each act is associated with a unique code and endpoint. There are at least two different endpoints that return XML. Use the one that ends in “_01/xml”. 
  ( Example endpoint : https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/08036_01/xml ) 

  How to find BCLaws URL:  

    - 1. Go to https://www.bclaws.gov.bc.ca/civix/content/complete/statreg/?xsl=/templates/browse.xsl .  

    - 2. Browse the alphabetized list of public statutes and regulations and click the act you are looking for.  

    - 3. Copy the link that is the act name.  

    - 4. Append “/xml” to that URL. 

  NOTE 1: If the act name has changed and you only have the old name, searching here for the old name will give you the current name. 

  NOTE 2: When an act name changes, this endpoint is updated to the new name, so the URL should never need to be updated. 

Steps to follow:  

  1. Make a new key-value pair in the LEGISLATION_CODES object located in api/src/utils/constants/legislation-code-map.js formatted as:

    ```
    , 

    <actCode>: { 

    actApi: <BCLaws-API-URL> 

    } 
  ```

    The act name associated with this actCode will now be automatically updated during a daily cronJob. This will affect options lists (mainly search filters) in the front end. 
    NOTE: Future work could be moving this URL to the DB act-regulations-mapping collection and updating the endpoint that the cronjob calls to search through this collection for URLs, rather than manually adding entries to that constants file. 

  2. Run a migration to change the actName value to the act code. Instead of having the actual act name attached to records, we replace it with the intermediate act code which is mapped to the most recent name and is updated during a daily cronjob. This ensures that no further migrations need to be done on these records to update the act name.  
  NOTE: For instructions on how to create and run a migration, see the README in api/migrations/README.md 

    - The migration should update all records where actName == the old/current act name so that actName = the actCode. 

  3. Update any relevant integration utilities. The integration utilities do the ETL process on records imported from several government sources. Some of these sources do NOT include legislation data. In some cases, the integration utilities add hard-coded legislation data, including actName, to the records as they are written to the DB. Where that occurs, these utilities should be updated to write the relevant actCode instead of the actual act name. 
  NOTE: The integration utlities are part of a cronJob that imports and updates records daily. Cases where the legislation data is included in these imports and used in the records are acceptable as it is presumed that the data from these sources is already updated when necessary. 

The app should now be fully set-up to dynamically use the most up-to-date value for this specific act name. Another one down, only ~145~ 144 more to go.
