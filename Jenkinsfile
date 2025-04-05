pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'gallerique'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        KUBE_NAMESPACE = 'gallerique'
        PATH = "/usr/local/bin:${env.PATH}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .'
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )]) {
                        sh 'echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin'
                        sh 'docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG}'
                        sh 'docker push ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG}'
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Apply namespace if it doesn't exist
                    sh 'kubectl create namespace ${KUBE_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -'
                    
                    // Update image in deployment
                    sh "kubectl set image deployment/gallerique-deployment gallerique=${DOCKER_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG} -n ${KUBE_NAMESPACE}"
                    
                    // Apply configurations
                    sh 'kubectl apply -f k8s/ -n ${KUBE_NAMESPACE}'
                    
                    // Wait for rollout to complete
                    sh 'kubectl rollout status deployment/gallerique-deployment -n ${KUBE_NAMESPACE}'
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            // Clean up Docker images
            sh 'docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true'
            sh 'docker rmi ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG} || true'
        }
    }
} 