# NRPTI  

Natural Resources Public Transparency Initiative monorepo.  This supports the LNG Regulatory interface, Natural Resource Compliance and Enforcement Database, and soon the BC Mines Information site.

## Environments

### PUBLIC-NRCED
https://nrced.gov.bc.ca/

### NRPTI API/ADMIN
https://nrpti-f00029-prod.apps.silver.devops.gov.bc.ca/
  
### METABASE
https://metabase-f00029-prod.apps.silver.devops.gov.bc.ca/

### ClamAV
All documents uploaded to the NRPTI system are first checked by the ClamAV anti-virus service and rejected if they do not pass.  See [ClamAV BCGov Repo](https://github.com/bcgov/clamav) for more information.

# Running it locally

To run NRPTI locally, run the `api/` subdirectory and then the `angular/` subdirectory. See [api/README.md](api/README.md) for instructions to begin the process.

If you already have the API running, see [angular/README.md](angular/README.md) for instructions to run the frontend.

_Note: NRPTI Does not work in Firefox. Please use Safari or Chrome._

# VSCode Extensions

A list of recommended/helpful VS Code extensions.

## Linting/Formatting

- TSLint
- ESLint
- Prettier - Code formatter
- EditorConfig for VS Code

## Languages

- npm
- Angular Extension pack
  - This may include 'Beautify' which should be disabled as we are using Prettier.
- JavaScript (ES6) code snippets

## Doc + Comments

- Document This
- Better Comments
- Code Spell Checker
- Auto Comment Blocks

## General

- Auto-Open Markdown Preview
- Bracket Pair Colorizer
- Path intellisense
- SCSS intellisense
- Shell launcher

## Other

- Declarative Jenkinsfile Support

# How to Contribute

Fork the [repo](https://github.com/bcgov/NRPTI) and create pull requests against the [master](https://github.com/bcgov/NRPTI/tree/master) branch.

