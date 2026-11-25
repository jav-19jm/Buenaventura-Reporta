// =============================================================================
// Pipeline del frontend (React + Vite) de Buenaventura Reporta
//
//   Checkout → Build → Test → Docker Build → Delivery
//
// Todas las ramas y pull requests pasan por Checkout, Build y Test (CI).
// Solo `main` construye la imagen de producción y la despliega (CD).
//
// Jenkins corre en un contenedor que usa el Docker del servidor (docker.sock).
// Por eso nada se monta desde el workspace: reportes y artefactos se copian con `docker cp`.
// =============================================================================
pipeline {
  agent any

  options {
    skipDefaultCheckout()                 // el checkout es la etapa "Checkout"
    disableConcurrentBuilds()
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    APP_DIR    = '/opt/buenaventura'      // docker-compose.yml + .env de producción
    COMPOSE    = 'docker compose -f docker-compose.yml -f docker-compose.prod.yml'
    IMAGEN     = 'buenaventura/frontend'
    URL_PUBLICA = 'https://buenaventura-reporta.tech'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.TAG = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          env.PRUEBAS = "frontend-pruebas-${env.BUILD_TAG}".replaceAll('[^A-Za-z0-9_.-]', '-')
          // Clave PÚBLICA de Reverb (viaja al navegador). Vite la incrusta al compilar.
          env.REVERB_KEY = sh(
            script: 'grep -E "^REVERB_APP_KEY=" "$APP_DIR/.env" 2>/dev/null | cut -d= -f2- | tr -d \'"\' || true',
            returnStdout: true
          ).trim()
        }
        echo "Commit ${env.TAG} de la rama ${env.BRANCH_NAME}"
      }
    }

    stage('Build') {
      // npm ci + tsc -b (tipos) + vite build, dentro de la etapa "build" del Dockerfile
      steps {
        sh '''
          docker build --target build \
            --build-arg VITE_REVERB_APP_KEY="$REVERB_KEY" \
            -t $IMAGEN:build-$TAG .
        '''
      }
    }

    stage('Test') {
      // Vitest: pruebas unitarias de la lógica del cliente
      steps {
        sh '''
          mkdir -p reportes
          docker run --name "$PRUEBAS" $IMAGEN:build-$TAG \
            npx vitest run --reporter=default --reporter=junit --outputFile.junit=/tmp/vitest.xml
        '''
      }
      post {
        always {
          sh '''
            docker cp "$PRUEBAS:/tmp/vitest.xml" reportes/vitest.xml || true
            docker cp "$PRUEBAS:/app/dist" dist || true
            docker rm -f "$PRUEBAS" >/dev/null 2>&1 || true
          '''
          junit allowEmptyResults: true, testResults: 'reportes/vitest.xml'
        }
        success {
          // Artefacto del build: el sitio estático compilado
          archiveArtifacts artifacts: 'dist/**', fingerprint: true
        }
      }
    }

    stage('Docker Build') {
      when { branch 'main' }
      // Nginx + el build estático (reutiliza la caché de la etapa Build)
      steps {
        sh '''
          docker build --target prod \
            --build-arg VITE_REVERB_APP_KEY="$REVERB_KEY" \
            -t $IMAGEN:$TAG .
        '''
      }
    }

    stage('Delivery') {
      when { branch 'main' }
      steps {
        // Evita que la API y el frontend se desplieguen a la vez
        lock('despliegue-produccion') {
          sh '''
            cd "$APP_DIR"

            # Conserva la versión en producción para poder volver a ella
            docker image tag $IMAGEN:latest $IMAGEN:anterior 2>/dev/null || true
            docker image tag $IMAGEN:$TAG $IMAGEN:latest

            $COMPOSE up -d frontend

            if ! ./scripts/esperar-salud.sh frontend 90; then
              echo "La nueva versión no quedó healthy: se restaura la anterior"
              $COMPOSE logs --tail=80 frontend || true
              if docker image inspect $IMAGEN:anterior >/dev/null 2>&1; then
                docker image tag $IMAGEN:anterior $IMAGEN:latest
                $COMPOSE up -d frontend
              fi
              exit 1
            fi
          '''
          // Comprobación de punta a punta: Internet → Caddy (HTTPS) → frontend
          sh 'curl -fsS --retry 5 --retry-delay 3 --retry-all-errors "$URL_PUBLICA/healthz" && echo " ← $URL_PUBLICA responde"'
        }
      }
    }
  }

  post {
    always {
      sh 'docker image rm $IMAGEN:build-$TAG >/dev/null 2>&1 || true'
      sh 'docker image prune -f >/dev/null 2>&1 || true'
      deleteDir()
    }
  }
}
