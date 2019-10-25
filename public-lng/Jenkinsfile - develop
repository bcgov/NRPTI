pipeline {
  agent any
  options {
    skipDefaultCheckout()
  }
  stages {
    stage('Building: public (develop branch)') {
      steps {
        script {
          try {
            echo "Building: ${env.JOB_NAME} #${env.BUILD_ID}"
            notifyBuild("Building: ${env.JOB_NAME} #${env.BUILD_ID}", "YELLOW")
            openshiftBuild bldCfg: 'angular-on-nginx-build-angular-app-build', showBuildLogs: 'true'
          } catch (e) {
            notifyBuild("BUILD ${env.JOB_NAME} #${env.BUILD_ID} ABORTED", "RED")
            error('Stopping early…')
          }
        }
      }
    }
    stage('Deploying: public (develop branch)') {
      steps {
        script {
          try {
            notifyBuild("Deploying: ${env.JOB_NAME} #${env.BUILD_ID}", "YELLOW")
            openshiftBuild bldCfg: 'angular-on-nginx-build', showBuildLogs: 'true'
          } catch (e) {
            notifyBuild("BUILD ${env.JOB_NAME} #${env.BUILD_ID} ABORTED", "RED")
            error('Stopping early…')
          }
          notifyBuild("Deployed ${env.JOB_NAME} #${env.BUILD_ID}", "GREEN")
        }
      }
    }
  }
}

def notifyBuild(String msg = '', String colour = 'GREEN') {
  if (colour == 'YELLOW') {
    colorCode = '#FFFF00'
  } else if (colour == 'GREEN') {
    colorCode = '#00FF00'
  } else {
    colorCode = '#FF0000'
  }

  // Send notifications
  slackSend (color: colorCode, message: msg)
}
