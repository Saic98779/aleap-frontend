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
      npm run build
      echo "==== Build Output ===="
      ls -la dist/
    '''
      }
    }

    stage('Prepare Server Folder') {
      steps {
        sh '''
      ssh -o StrictHostKeyChecking=no $SERVER "mkdir -p $APP_PATH"
    '''
      }
    }

    stage('Deploy Frontend') {
      steps {
        sh '''
      ssh -o StrictHostKeyChecking=no $SERVER "rm -rf $APP_PATH/*"
      scp -o StrictHostKeyChecking=no -r dist/skill-development/* $SERVER:$APP_PATH/
      ssh -o StrictHostKeyChecking=no $SERVER "sudo chown -R www-data:www-data $APP_PATH && sudo chmod -R 755 $APP_PATH"
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
