pipeline {
  agent any

  environment {
    SERVER = "ubuntu@51.222.155.92"
    APP_PATH = "/home/ubuntu/frontend"
  }

  stages {
    stage('Clean Workspace') {
      steps {
        deleteDir()
      }
    }

    stage('Clone Repository') {
      steps {
        git branch: 'main',
          url: 'https://github.com/Saic98779/aleap-frontend.git'
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm install --legacy-peer-deps'
      }
    }

    stage('Build Frontend Application') {
      steps {
        sh '''
      set -e
      npm run build
      echo "==== Build Output ===="
      ls -la dist/
    '''
      }
    }

    stage('Deploy Frontend') {
      steps {
        sh '''
      set -e

      echo "==== Preparing temp folder ===="
      ssh -o StrictHostKeyChecking=no $SERVER "rm -rf /tmp/frontend && mkdir -p /tmp/frontend"

      echo "==== Copying build to server (/tmp) ===="
      scp -o StrictHostKeyChecking=no -r dist/skill-development/* $SERVER:/tmp/frontend/

      echo "==== Moving files to final location ===="
      ssh -o StrictHostKeyChecking=no $SERVER "
        sudo rm -rf $APP_PATH/* &&
        sudo cp -r /tmp/frontend/* $APP_PATH/ &&
        sudo chown -R www-data:www-data $APP_PATH &&
        sudo chmod -R 755 $APP_PATH
      "
    '''
      }
    }

    stage('Reload Nginx') {
      steps {
        sh '''
      ssh -o StrictHostKeyChecking=no $SERVER "sudo systemctl reload nginx"
    '''
      }
    }

  }

  post {
    success {
      echo 'Deployment Successful!'
    }
    failure {
      echo 'Deployment Failed!'
    }
  }
}
