![API tests](https://github.com/bcgov/NRPTI/workflows/API%20tests/badge.svg) ![Front-End tests](https://github.com/bcgov/NRPTI/workflows/Front-End%20tests/badge.svg)
 
# NRPTI  

Natural Resources Public Transparency Initiative monorepo.  This supports the LNG Regulatory interface, Natural Resource Compliance and Enforcement Database, and soon the BC Mines Information site.

## Environments

### PUBLIC-LNG
- Dev: https://public-lng-dev.pathfinder.gov.bc.ca/
- Test: https://public-lng-test.pathfinder.gov.bc.ca/
- Prod: TBD

### PUBLIC-NRCED
- Dev: https://public-nrced-dev.pathfinder.gov.bc.ca/
- Test: https://public-nrced-test.pathfinder.gov.bc.ca/
- Prod: https://nrced.gov.bc.ca/

### NRPTI API/ADMIN
- Dev:
  - Api: https://nrpti-dev.pathfinder.gov.bc.ca/api/docs/
  - Admin: https://admin-nrpti-dev.pathfinder.gov.bc.ca/
- Test:
  - Api: https://nrpti-test.pathfinder.gov.bc.ca/api/docs/
  - Admin: https://admin-nrpti-test.pathfinder.gov.bc.ca/,
- Prod:
  - Api: https://nrpti-prod.pathfinder.gov.bc.ca/api/docs/
  - Admin: https://admin-nrpti-prod.pathfinder.gov.bc.ca/
  
### METABASE
- Dev: https://metabase-nrpti-dev.pathfinder.gov.bc.ca
- Test: https://metabase-nrpti-test.pathfinder.gov.bc.ca
- Prod: https://metabase-nrpti-prod.pathfinder.gov.bc.ca

### Jenkins
- https://jenkins-prod-iarjfo-tools.pathfinder.gov.bc.ca/

### SonarQube
- https://sonarqube-iarjfo-tools.pathfinder.gov.bc.ca/projects

### ClamAV
All documents uploaded to the NRPTI system are first checked by the ClamAV anti-virus service and rejected if they do not pass.  See [ClamAV BCGov Repo](https://github.com/bcgov/clamav) for more information.

# Running it locally

Please see the READMEs in the `angular/` and `api/` subdirectories.

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
