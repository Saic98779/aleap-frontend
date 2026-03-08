pipeline {
  agent any
  environment {
    SERVER = "ubuntu@51.222.155.92"
    APP_PATH = "/home/ubuntu/frontend"
  }

  stages {

    stage('Clone Repository') {
      steps {
        git branch: 'main',
          url: 'https://github.com/Saic98779/aleap-frontend.git'
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Build Frontend') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Prepare Server Folder') {
      steps {
        sh '''
            ssh $SERVER "mkdir -p $APP_PATH"
            '''
      }
    }

    stage('Deploy Frontend') {
      steps {
        sh '''
            scp -r dist/skill-development/* $SERVER:$APP_PATH/
            '''
      }
    }

    stage('Reload Nginx') {
      steps {
        sh '''
            ssh $SERVER "sudo systemctl reload nginx"
            '''
      }
    }

  }
}
