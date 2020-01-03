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

            // Need to check eachline for either angular/ or api/
            def angular = false;
            def api = false;
            filesInThisCommitAsString.eachLine {
              if (it =~ /angular/) {
                angular = true;
              }
              if (it =~ /api/) {
                api = true;
              }
            }
            echo "Angular: ${angular}, API: ${api}"
            if (angular) {
              // Fire up the angular builder
              echo "Running Angular builder"
              // openshiftBuild bldCfg: 'angular-app-build', showBuildLogs: 'true'
              // openshiftBuild bldCfg: 'admin-nrced-build', showBuildLogs: 'true'
              // openshiftBuild bldCfg: 'public-lng-build', showBuildLogs: 'true'
              def angularSelector = openshift.selector("bc", "angular-app-build").startBuild()
              angularSelector.untilEach(1) {
                return it.object().status.phase == "Complete"
              }
              echo "Deploying to NRCED Admin"
              def nrcedSelector = openshift.selector("bc", "admin-nrced-build").startBuild()
              nrcedSelector.untilEach(1) {
                return it.object().status.phase == "Complete"
              }
              echo "Deploying to NRCED Public"
              def publicNRPTI = openshift.selector("bc", "public-nrced-build").startBuild()
              publicNRPTI.untilEach(1) {
                return it.object().status.phase == "Complete"
              }
              echo "Deploying to PUBLIC LNG"
              def lngSelector = openshift.selector("bc", "public-lng-build").startBuild()
              lngSelector.untilEach(1) {
                return it.object().status.phase == "Complete"
              }
              echo "Front end builds complete and deployed to Dev"
            }
            if (api) {
              // Fire up the api builder
              echo "Running API builder"
              def apiSelector = openshift.selector("bc", "nrpti-api").startBuild()
              apiSelector.untilEach(1) {
                return it.object().status.phase == "Complete"
              }
              echo "Deploying to Dev"
            }
          }
        }
      }
    }
  }
}
