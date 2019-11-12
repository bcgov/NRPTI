# Tools

The Natural Resources Applications are currently hosted in [RedHat OpenShift](https://www.openshift.com) operated by [BCDevExchange](https://bcdevexchange.org).  We follow the guidelines and principles of the [BCDevOps](https://github.com/BCDevOps) team. We make every attempt to use, or build off the tooling and scripts that BCDevOps (through the [DevHub](https://developer.gov.bc.ca)) provides.

As part of the BCDevOps community, each project will have 4 OpenShift namespaces allocated:

| Namespace | Description |
| --- | --- |
| Dev | development "environment", will contain a deployment from the master branch and N deployments for [pull requests](https://help.github.com/en/articles/about-pull-requests). |
| Test | test and Quality Assurance, will contain deployment from master branch. Promotions to be manually approved. |
| Prod | production. The user ready application. Promotions to be manually approved. |
| Tools | devops namespace. |

The tools directory contains all the infrastructure-as-code that we use for devops. Although there are many ways to build/test/deploy, this is the way we are doing it.  We currently rely less on OpenShift to do promotions, and more on our own Continuous Integration/Continuous Delivery ([CI/CD](https://en.wikipedia.org/wiki/CI/CD)).  This affords us more control over the workflow and add tooling as needed.  Currently, the tools in use are: Jenkins and Sonarqube.

## Prerequisites

All of the following instructions and examples are written for a *nix based system.  If you are on Windows, you may have to make some adjustments; particularly around piping `|`, setting environment variables and environment variable substitution. We suggest that Windows users consider using the Windows Subsystem for Linux (WSL) in order to minimize potential conflicts with the local environment. Check the [Microsoft Documentation](https://docs.microsoft.com/en-us/windows/wsl/install-win10) for more information on how to install WSL on your system.

You should have your 4 OpenShift namespaces (dev, test, prod, tools) and you should have admin access. We assume that whomever is running these commands has admin privileges to the 4 OpenShift projects.

You will need to install the OpenShift command line tools and have them in your path.  Login to OpenShift via web console, click on the Help icon (question mark), click Command Line Tools and follow the instructions.

You will need a github account and token (preferrably a team shared account) with access to your repo: [New Personal Access Token](https://github.com/settings/tokens/new?scopes=repo,read:user,user:email,admin:repo_hook).

## Environment Variables

For simplicity sake, we will be setting all our project specific values as environment variables and substitute them into the oc commands.  The following are just examples and will need to be changed to your specific projects/namespaces, credentials, etc.

### DevOps Tools Repository

Configure environment variables to access and run DevOps Tools scripts.

```sh
export tools_repo_owner=bcgov
export tools_repo_name=nr-showcase-devops-tools
export tools_repo_url=https://github.com/$tools_repo_owner/$tools_repo_name.git
export tools_repo_ref=master
export tools_repo_raw=https://raw.githubusercontent.com/$tools_repo_owner/$tools_repo_name/$tools_repo_ref
export templates_url=$tools_repo_raw/tools/jenkins/openshift
```

### Namespace Enumeration

Configure the 4 environment namespaces for your application.

```sh
export ns_prefix=<your-namespace-prefix>
export tools=$ns_prefix-tools
export dev=$ns_prefix-dev
export test=$ns_prefix-test
export prod=$ns_prefix-prod
```

### Github Repository and Credentials for Application

Configure your application repository details.  This is the application that will be built and deployed by the pipeline.

```sh
export gh_username=<github account>
export gh_password=<personal access token, see above>
export repo_owner=<your github account>
export repo_name=<your application repo>
```

### Application Details

Configure any remaining application specific details here.

```sh
export app_name=<your application acronym/short name>
export app_domain=pathfinder.gov.bc.ca
```

### Login to OpenShift

Once you have all of the environment variables defined, login to Openshift via web console, click your login name at top tight and click "Copy Login Command".  Go to your terminal, go to your project root and paste the copy command.

### Go to Tools Namespace/Project

Once logged into the OpenShift console, go to your tools project.  Each oc command should use the `-n <NAMESPACE>` option, but being in your tools project is just another safeguard.

```sh
oc project $tools
```

## SonarQube

SonarQube should be installed and configured first, as the Jenkins will run the pipeline which will may require SonarQube.  So, stand up and configure SonarQube first.

SonarQube is a static analysis tool which assists with improving and maintaining code quality. For this tool to work, you will need the SonarQube server, as well as an agent that runs the sonar-scanner (this can be local or in Jenkins).

### SonarQube Server Setup

To deploy a SonarQube server instance to our tools project we simply leverage the prebuilt server image provided by the BCDevOps organization found on the [BCDevOps SonarQube repository](https://github.com/BCDevOps/sonarqube).

We outline below the rapid startup steps to get SonarQube Server setup. Refer to the original repository for more details if necessary.

#### SonarQube Deploy

You will need to use the `sonarqube-postgresql-template.yaml` file in order to deploy it to openshift. This will deploy BOTH the PostgreSQL database AND the SonarQube server.

*Note: At the time of writing, the master branch of BCDevOps SonarQube repo was at commit `bbb9f62e29706b61382cf24d7ad7e08f2476a01f`.  And the template was at commit `bc80961d75eed66ec70ca022a6444963341fb39f`.*

Deploying the database is done with the following:

```sh
oc -n $tools new-app -f https://raw.githubusercontent.com/BCDevOps/sonarqube/bc80961d75eed66ec70ca022a6444963341fb39f/sonarqube-postgresql-template.yaml --param=SONARQUBE_VERSION=6.7.5
```

Let the SonarQube pods spin up, you can then go to `https://sonarqube-<$tools>.pathfinder.gov.bc.ca` and watch until SonarQube is ready.  Now you can set the admin password.

#### Admin Password

The SonarQube server instance is created with standard insecure credentials (User: `admin`, PW:). This should be reset to something stronger and stored in an OpenShift secret so authorized developers can find it.

The BCDevOps SonarQube repo provides a script that will generate a random PW, set it in SonarQube, and create a secret. This can be found under the  `/provisioning` folder of the cloned BCDevOps repo.

In order to directly get the password reset script, run the following:

```sh
curl https://raw.githubusercontent.com/BCDevOps/sonarqube/bbb9f62e29706b61382cf24d7ad7e08f2476a01f/provisioning/updatesqadminpw.sh > updatesqadminpw.sh
```

Then simply run the following script and follow its instructions. Make sure you save the new password in an OpenShift secret or equivalent!  Ensure that the SonarQube app is fully deployed and operational before running this script.

```sh
chmod +x updatesqadminpw.sh && ./updatesqadminpw.sh
```

Go to `https://sonarqube-<$tools>.pathfinder.gov.bc.ca` and log in as `admin` with the new password (it is stored in sonarqube-admin-password secret).

## Jenkins

Uses BCDevOps CICD Jenkins Basic install.  This Jenkins install includes a number of customizations. A customization of particular note is that it will register GitHub webhooks.  [link](https://github.com/BCDevOps/openshift-components/tree/master/cicd/jenkins-basic)

The commands, labels, and naming conventions follow the Pull Request Pipeline principles of the BCDevOps pipeline-cli [link](https://github.com/BCDevOps/pipeline-cli).

The jobs that Jenkins creates and uses will also follow those principles and build out an "environment" for each pull request.

Jenkins will include a slave/builder that can execute Node builds and run Sonarqube scanner.  You can use this as a reference if you need to create additional slaves (ex. python builds).  See [jenkins/openshift/build-slave.yaml](jenkins/openshift/build-slave.yaml).

### Additional Setup Files/Scripts

* **jenkins/docker/contrib/jenkins/configuration**

    We need to make some additional configuration changes to the BCDevOps CICD Jenkins Basic install.  Under the [jenkins/docker/contrib/jenkins/configuration](jenkins/docker/contrib/jenkins/configuration) directory, we have additional start up scripts and configuration overrides.

* **org.jenkinsci.plugins.workflow.libs.GlobalLibraries.xml**

    We pull in [BCDevOps Jenkins Pipeline Shared Lib](https://github.com/BCDevOps/jenkins-pipeline-shared-lib).  This provides us some functions for examining the Git repos and commits. We can use these functions in Jenkinsfiles and other grovy scripts.

* **scriptApproval.xml**

    For our configuration groovy scripts, we need to allow certain jenkins and third party plugin scripts to run.  We override the restrictions here.

* **init.groovy.d/003-create-jobs.groovy**

    This groovy script will build 2 jobs in Jenkins.  One that will build the master branch, and one that will build pull requests.

    To add or change the jobs, this is where you want to go.  The name of this file is important, as it needs to get run *BEFORE* the 003-register-github-webhooks.groovy included in the basic install.  Scripts are run alphabetically.  The jobs need to be created before the github webhooks are created.  Our jobs script will read secrets and configmaps created during this setup; described below.

    These jobs are configured to use [Jenkinsfile](https://github.com/bcgov/nr-showcase-devops-tools/blob/master/Jenkinsfile) and [Jenkinsfile.cicd](https://github.com/bcgov/nr-showcase-devops-tools/blob/master/Jenkinsfile.cicd) found at the root of your project repository.  These Jenkinsfiles will make use of the OpenShift ConfigMaps we will create below.

* **init.groovy.d/100-jenkins-config-set-admin-address.groovy**

    This groovy script will update the admin email address.  It is not necessary, but an example of further customization to Jenkins.  If you are swiping this, keep in mind the email address is hardcoded.

### Project Prerequisites

We are setting up a CICD pipeline to build and deploy a specific project.  In order for this to work, there are expectations on those projects.  Currently, each project will require 3 files at the __root__ of the repository.

| Name | Description |
| --- | --- |
| `Jenkinsfile` | this is the master branch build pipeline |
| `Jenkinsfile.cicd` | this is the Pull Request build pipeline |
| `sonar-project.properties` | this is will configure your SonarQube scans |

A very simple example to demonstrate a build and SonarQube analysis (no additional setup, no servers, no deployments), can be found at the [nr-showcase-devops-tools-demo-sq](https://github.com/bcgov/nr-showcase-devops-tools-demo-sq.git) repo.  This can be forked and used to test the Jenkins and SonarQube installation, and to demonstrate the master and pull request jobs.  For instance, the master branch will show Code Smells and duplicates in SonarQube.  In you fork, create a pull request that corrects these and see how the PR Jenkins job kicks off.

For more fully featured pipeline examples, you may refer to the following projects:

* [NR Get Token](https://github.com/bcgov/nr-get-token.git)
* [NR Messaging Service Showcase](https://github.com/bcgov/nr-messaging-service-showcase.git)

A very simple example to demonstrate a build and SonarQube analysis (no additional setup, no servers, no deployments), can be found at [nr-showcase-devops-tools-demo-sq](https://github.com/bcgov/nr-showcase-devops-tools-demo-sq.git).  This can be forked and used to test the Jenkins and SonarQube installation, and to demonstrate the master and pull request jobs.  For instance, the master branch will show Code Smells and duplicates in SonarQube.  In you fork, create a pull request that corrects these and see how the PR Jenkins job kicks off.

### Jenkins Server Setup

The following commands setup up Jenkins and uses this repository and specific OpenShift project namespaces.

#### Create Secrets

The BCDevOps CICD Jenkins Basic install requires a template github secret and a template for the slave.  This will create the secrets named as it requires.

```sh
oc -n $tools process -f "$templates_url/secrets.yaml" -p GH_USERNAME=$gh_username -p GH_PASSWORD=$gh_password | oc  -n $tools create -f -
```

#### Create ConfigMap for related namespaces

For our custom jobs scripts and Jenkinsfiles.

```sh
oc -n $tools process -f "$templates_url/ns-config.yaml" -p DEV=$dev -p TEST=$test -p PROD=$prod -p TOOLS=$tools | oc  -n $tools create -f -
```

#### Create ConfigMap for the application

For our custom jobs scripts and Jenkinsfiles.

```sh
oc -n $tools process -f "$templates_url/jobs-config.yaml" -p REPO_OWNER=$repo_owner -p REPO_NAME=$repo_name -p APP_NAME=$app_name -p APP_DOMAIN=$app_domain | oc -n $tools create -f -
```

#### Add Service Account Access to other Projects

This is required in order to allow Jenkins to have the RBAC permissions to handle deployments in other namespaces.

```sh
oc -n $dev policy add-role-to-user admin system:serviceaccount:$tools:jenkins-prod
oc -n $test policy add-role-to-user admin system:serviceaccount:$tools:jenkins-prod
oc -n $prod policy add-role-to-user admin system:serviceaccount:$tools:jenkins-prod
```

#### Process the BuildConfig templates

These build configs have no build triggers, we start them manually - we don't want OpenShift to automatically deploy on a configuration change or an image change.

The parameters and labels we are providing match up with the BCDevOps pipeline-cli.  Although we are not using the pipeline-cli, we try to align ourselves with its philosophies.  We will consider this deployment of Jenkins to be our "prod" deployment.  We are not providing all the labels pipeline-cli would, but the most important ones for identifying the app and the environment.

##### Master BuildConfig

```sh
oc -n $tools process -f "$templates_url/build-master.yaml" -p NAME=jenkins -p SUFFIX=-prod -p VERSION=prod-1.0.0 -p SOURCE_REPOSITORY_URL=$tools_repo_url -p SOURCE_REPOSITORY_REF=$tools_repo_ref -o yaml | oc -n $tools create -f -
```

##### Slave BuildConfig

Create the slave build config and image stream, and then we add a build trigger for our main jenkins image.  This will allow the slave image to be built automatically when the master Jenkins image is built.  For whatever reason, having the build trigger in the build config template doesn't work - it is stripped out.

```sh
oc -n $tools process -f "$templates_url/build-slave.yaml" -p NAME=jenkins -p SUFFIX=-prod -p VERSION=prod-1.0.0 -p SLAVE_NAME=main -p SOURCE_IMAGE_STREAM_TAG=jenkins:prod-1.0.0 -o yaml | oc -n $tools create -f -

oc -n $tools set triggers bc jenkins-slave-main-prod --from-image=$tools/jenkins:prod-1.0.0
```

##### Build master (and slave)

Once the master is built, the slave's  build will be triggered.   Wait until the two images are built, then move on to deployment.

```sh
oc -n $tools start-build bc/jenkins-prod
```

#### Process the Deployment templates

Once the two images are created from the builds of the previous step, you may proceed with deploying those images.

##### Master DeploymentConfig

```sh
oc -n $tools process -f "$templates_url/deploy-master.yaml" -p NAME=jenkins -p SUFFIX=-prod -p VERSION=prod-1.0.0 -p ROUTE_HOST=jenkins-prod-$tools.$app_domain -p GH_USERNAME=$gh_username -p GH_PASSWORD=$gh_password -o yaml | oc -n $tools create -f -
```

##### Slave DeploymentConfig

```sh
oc -n $tools process -f "$templates_url/deploy-slave.yaml" -p NAME=jenkins -p SUFFIX=-prod -p VERSION=prod-1.0.0 -p NAMESPACE=$tools -p SLAVE_NAME=build -o yaml | oc -n $tools create -f -
```

Give the process a few minutes. If it is successful, you should be able to get onto your new Jenkins server with the appropriate URL as specified by the route. Assuming you have reached this step and there are no errors, you will have successfully completed the tools deployment and are ready to do development.

## Updates

The BCDevOps team will be continually updating Jenkins for security patches and plugin patches. This section outlines the process to bring existing deployments up to alignment with the latest versions of software available.

### Jenkins Base Image Update

If the [base image](https://github.com/BCDevOps/openshift-components/tree/master/cicd/jenkins-basic) for Jenkins is updated, you can update by starting a new build.  Since our build is based on `jenkins-basic:v2-latest`, any time the image for that tag is updated, we can update our instance with a re-build.  Because our slave image has a trigger for our `jenkins:prod-1.0.0` image stream tag, the slave will be re-built.  Both the master and slave deployments are triggered on new builds.  So, by re-building the master image, we build and redeploy our whole Jenkins instance in one action.  This means you should schedule your updates around your application builds.

```sh
oc -n $tools start-build bc/jenkins-prod
```

## Cleanup

Should you need to tear down the Jenkins and SonarQube, you will want to run the following commands. Make sure you are sure this is what you want to do as this is a destructive operation. You WILL NOT be able to recover old stored data!

### SonarQube Cleanup

```sh
oc -n $tools delete all,template,secret,cm,pvc,sa,rolebinding --selector app=sonarqube
oc -n $tools delete secret sonarqube-admin-password
```

### Jenkins Cleanup

```sh
oc -n $tools delete all,template,secret,cm,pvc,sa,rolebinding --selector app=jenkins-prod
```

## Local Development Notes

This section contains notes about how to do certain CI/CD tasks on your local machine.

### SonarQube Scanner

In order for static code analysis to happen, there must be a scanner agent that processes the code. This is achieved with the sonar-scanner distribution which can be found [here](https://github.com/SonarSource/sonar-scanner-cli). This is preinstalled on the Jenkins Slave agent.

*Note: At the time of writing, we are currently using version `3.3.0.1492`.*

#### Run scan locally

Should you wish to install and use `sonar-scanner` locally, follow the appropriate instructions depending on your platform.

##### *nix

```sh
curl -o /tmp/sonar-scanner-cli.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-3.3.0.1492-linux.zip
unzip /tmp/sonar-scanner-cli.zip -d /tmp/sonar-scanner-cli
mv /tmp/sonar-scanner-cli/sonar-scanner-3.3.0.1492-linux /opt/sonar-scanner
ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin
```

##### Windows

*Note: The following assumes you are using the [Chocolatey Package Manager](https://chocolatey.org/). If you are not using Chocolatey, you will need to figure out how to get the client from the [official website](https://www.sonarqube.org/downloads/).*

```powershell
choco install -y sonarqube-scanner.portable --version 3.3.0.1492
```

### Static Analysis

Once you have `sonar-scanner` installed, ensure that you are in the same directory as the `sonar-project.properties` file. Then all you need to do is run the following (replace the arguments as necessary):

```sh
sonar-scanner -Dsonar.host.url='CHANGEURLHERE' -Dsonar.projectKey='CHANGEPROJECTKEYHERE' -Dsonar.projectName='NR Get Token (CHANGEBRANCHNAMEHERE)'
```
