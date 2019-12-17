pipeline {
  agent none
  options {
    disableResume()
  }
  stages {
    stage('Build') {
      agent { label 'build' }
      steps {
        script {
          openshift.withCluster() {
            def filesInThisCommitAsString = sh(script:"git diff --name-only HEAD~1..HEAD | grep '^' || echo -n ''", returnStatus: false, returnStdout: true).trim()
            def hasChangesInPath = (filesInThisCommitAsString.length() > 0)
            echo "Files Changed ..."
            echo "${filesInThisCommitAsString}"
            if (!currentBuild.rawBuild.getCauses()[0].toString().contains('UserIdCause') && !hasChangesInPath){
              currentBuild.rawBuild.delete()
              error("No changes detected in the path ('^')")
            }
            if (filesInThisCommitAsString.startsWith('angular/projects')) {
              // Fire up the angular builder
              echo "Running Angular builder"
              openshiftBuild bldCfg: 'angular-app-build', showBuildLogs: 'true'
              openshiftBuild bldCfg: 'admin-nrced-build', showBuildLogs: 'true'
              openshiftBuild bldCfg: 'public-lng-build', showBuildLogs: 'true'
            }
            if (filesInThisCommitAsString.startsWith('api/')) {
              // Fire up the api builder
              echo "Running API builder"
              // openshiftBuild bldCfg: 'nrpti-api', showBuildLogs: 'true'
              openshift.selector("bc", "nrpti-api").startBuild()
            }
          }
        }
      }
    }
    // stage('Deploy (DEV)') {
    //   agent { label 'deploy' }
    //   steps {
    //     echo "Deploying ..."
    //   }
    // }
    // stage('Deploy (PROD)') {
    //   agent { label 'deploy' }
    //   input {
    //     message "Should we continue with deployment to PROD?"
    //     ok "Yes!"
    //   }
    //   steps {
    //     echo "Deploying ..."
    //   }
    // }
    // stage('Acceptance') {
    //   agent { label 'deploy' }
    //   input {
    //     message "Should we continue with cleanup?"
    //     ok "Yes!"
    //   }
    //   steps {
    //     echo "Cleaning ..."
    //   }
    // }
  }
}
