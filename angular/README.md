# bcgov/nrpti/angular

Angular front-ends for the Natural Resources Public Transparency Interface (NRPTI) application.

- [admin-nrpti](https://github.com/bcgov/nrpti/angular/projects/admin-nrpti) - front-end for nrced admin users.
- [public-nrced](https://github.com/bcgov/nrpti/angular/projects/public-nrpti) - front-end for nrced public users.
- [public-lng](https://github.com/bcgov/nrpti/angular/projects/public-lng) - front-end for lng public users.
- [common](https://github.com/bcgov/nrpti/angular/projects/common) - common components for NRPTI front-end sites.
- [global](https://github.com/bcgov/nrpti/angular/projects/global) - global components for angular front-end sites.

# Prerequisites

| Technology | Version | Website                 | Description                               |
| ---------- | ------- | ----------------------- | ----------------------------------------- |
| node       | 10.x.x  | https://nodejs.org/en/  | JavaScript Runtime                        |
| npm        | 6.x.x   | https://www.npmjs.com/  | Node Package Manager                      |
| ng         | 7.x.x   | https://cli.angular.io/ | Angular CLI                               |
| yarn       | latest  | https://yarnpkg.com/en/ | Package Manager (more efficient than npm) |

_Note: This app also requires [bcgov/nrpti/api](https://github.com/bcgov/nrpti/api) to handle its requests and authentication._

## Install [Node + NPM](https://nodejs.org/en/)

_Note: Windows users can use [NVM Windows](https://github.com/coreybutler/nvm-windows) to install and manage multiple versions of Node+Npm._

## Install [Angular CLI](https://cli.angular.io/)

_Note: Use `@angular/cli`. Do not use `@angular/angular-cli`._

```
npm install -g @angular/cli
```

## Install [Yarn](https://yarnpkg.com/lang/en/docs/install/#alternatives-tab)

```
npm install -g yarn
```

# Angular Multi-Project Workspace

This is a multi-project angular workspace.

It contains many angular applications/libraries, under a single base set of dependencies and configs.

### Applications

Traditional Angular applications which can be built and served.

### Libraries

Angular libraries must be published to NPM, or similar, and be imported into an Applications package.json

During development, a library can be built and symlinked instead of published. This eliminates the need to constantly publish a work-in-progress library.

# Build and Run

## Dev

### Serve

1. Download dependencies

    ```
    yarn
    ```

2. Build library/symlink

    ```
    npm run build:library:dev
    ```

    _Note: You must re-build the library whenever a change is made that needs to be captured by the consuming angular projects._

3. Serve the app(s)

    - Serve all apps

      ```
      npm start
      ```

      _Note: This will run all angular applications in parallel, in the same console._

    - Serve specific app

      ```
      npm start:<project-name>
      ```

### Build

1. Download dependencies

    ```
    yarn
    ```

2. Build library/symlink and apps

    - Build library/symlink and all apps

      ```
      npm run build
      ```

    - Build specific library/symlink and specific app(s)

      ```
      npm run build:library:dev
      npm run build:app:<project-name>
      ```

## Prod

1. Download dependencies

    ```
    yarn
    ```

2. Run the build(s)

    The build artifacts will be stored in the `./dist/<project-name>` directory.

    _Note: This assumes all necessary libraries have been published and are included as dependencies in `package.json`_

    - Build all apps

      ```
      npm run build:prod
      ```

# Linting and Formatting

## Info

Linting and formatting is handled by a combiation of `TSlint` and `Prettier`. The reason for this, is that you get the best of both worlds: TSlint's larger selection of linting rules with Prettier's robust formatting rules.

These 2 linters (tslint, Prettier) do have overlapping rules. To avoid weird rule interactions, TSlint has been configured to defer any overlapping rules to Prettier, via the use of `tslint-config-prettier` in `tslint.json`.

Recommend installing the [VSCode Prettier extension](https://github.com/prettier/prettier-vscode), so Prettier's formatting can be applied on-the-fly.

### Technolgies used

[TSLint](https://palantir.github.io/tslint/), [Prettier](https://prettier.io/), [Stylelint](https://stylelint.io/)

### Configuration files

- TSlint: tslint.json
- Prettier: .prettierrc .prettierignore
- Stylelint: .styleintrc
- lint-staged: .lintstagedrc

## Run Linters + Formatters + Auto Fix

_Note: Not all linting/formatting errors can be automatically fixed, and will require human intervention._

- Run all linters and fix all problems, in series

  ```
  npm run lint
  ```

- Lint and fix the `*.ts` files using `TSLint` + `Prettier`.

  ```
  npm run lint:ts
  ```

- Lint and fix the `*.scss` files using `Stylelint`.

  ```
  npm run lint:scss
  ```

# Testing

## Info

### Technolgies used

[Jasmine](https://jasmine.github.io/), [Karma](https://karma-runner.github.io/latest/index.html), [Protractor](http://www.protractortest.org/)

### Important Note

When viewing test output in the browser, via localhost:9876, Firefox produces somewhat cryptic error output. Chrome doesn't have this issue.

## Run Tests

- Run the unit tests with `watch=false` and run the coverage report

  View the coverage report at `./coverage/<project>/index.html`

  ```
  npm test
  ```

- Run the unit tests with `watch=true`

  The live test page can be viewed at localhost:9876.

  ```
  npm run test-ci
  ```

# Code Scaffolding Using Angular CLI

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

## Generate a customer component

```
ng g c customer
```

## Generate a directive: search-box

```
ng g d search-box
```

## Generate a service: general-data

```
ng g s general-data
```

Angular will give out a warning line after this command:

> WARNING Service is generated but not provided, it must be provided to be used

After generating a service, we must go to its owning module and add the service to the `providers` array.

## Generate a service and include it in a module automatically

```
ng g s general-data2 -m app.module
```

## Generate a class, an interface and enum

```
# class
ng g cl models/customer

# interface
ng g i models/person

# enum
ng g enum models/gender
```

## Generate a pipe

```
ng g pipe shared/init-caps
```

## Generate a module

Create a login directory and generate a login module in that directory.

```
ng g module login/login.module
```

## Add/Generate Routing Features

Generate a module called admin and add routing feature to it.

```
ng g module admin --routing
```

## Change aspects of the application

### Change style dialect

```
ng set default.styleExt css
```

## Regenerate a brand new project with routing and scss options

```
ng new my-app --routing --style scss
```
