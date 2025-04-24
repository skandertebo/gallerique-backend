pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'gallerique'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        KUBE_NAMESPACE = 'gallerique'
        PATH = "/usr/local/bin:${env.PATH}"
        HELM_RELEASE = 'gallerique'
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
        
        stage('Deploy with Helm') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                        sh '''
                            export KUBECONFIG=${KUBECONFIG}
                            helm upgrade --install ${HELM_RELEASE} gallerique-helm/ \
                                --namespace ${KUBE_NAMESPACE} \
                                --set image.repository=${DOCKER_USERNAME}/${DOCKER_IMAGE} \
                                --set image.tag=${DOCKER_TAG} \
                                --set mysql.auth.password=${MYSQL_PASSWORD} \
                                --set mysql.auth.rootPassword=${MYSQL_ROOT_PASSWORD}
                        '''
                    }
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
    }
} 