pipeline {
  agent any
  stages {
    stage('Building: lng-public (master branch)') {
      steps {
        script {
          try {
            echo "Building: ${env.JOB_NAME} #${env.BUILD_ID}"
            openshiftBuild bldCfg: 'angular-on-nginx-build-angular-app-build', showBuildLogs: 'true'
          } catch (e) {
            error('Stopping early…')
          }
        }
      }
    }
    stage('Deploying: lng-public (master branch)') {
      steps {
        script {
          try {
            openshiftBuild bldCfg: 'angular-on-nginx-build', showBuildLogs: 'true'
          } catch (e) {
            error('Stopping early…')
          }
        }
      }
    }
  }
}
