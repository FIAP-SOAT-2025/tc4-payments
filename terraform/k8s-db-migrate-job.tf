resource "kubectl_manifest" "db_migrate_job" {
  depends_on = [kubectl_manifest.secrets, kubectl_manifest.configmap]
  yaml_body  = <<YAML
apiVersion: batch/v1
kind: Job
metadata:
  name: payments-db-migrate-job
  namespace: lanchonete-payments
spec:
  template:
    spec:
      containers:
      - name: migrate-db
        image: ${var.docker_image}
        imagePullPolicy: IfNotPresent
        command: ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed"]
        envFrom:
        - configMapRef:
            name: payments-configmap
        - secretRef:
            name: payments-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
      restartPolicy: Never
  backoffLimit: 4

YAML
}