![API tests](https://github.com/bcgov/NRPTI/workflows/API%20tests/badge.svg) ![Front-End tests](https://github.com/bcgov/NRPTI/workflows/Front-End%20tests/badge.svg)

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

**IMPORTANT:** Please read through this confluence page before running anything.
https://apps.nrs.gov.bc.ca/int/confluence/pages/viewpage.action?pageId=208740091

See the READMEs in the `angular/` and `api/` subdirectories for further instructions.

# VSCode Extensions

A list of recommended/helpful VS Code extensions.

## Linting/Formatting

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

