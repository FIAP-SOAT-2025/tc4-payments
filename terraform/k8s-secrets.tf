resource "kubectl_manifest" "secrets" {
  depends_on = [kubernetes_namespace.payments_ns, aws_db_instance.payments_db]
  yaml_body  = <<YAML
apiVersion: v1
kind: Secret
metadata:
  name: payments-secrets
  namespace: lanchonete-payments
type: Opaque
data:
  DB_USER: ${base64encode(var.db_user)}
  DB_PASSWORD: ${base64encode(var.db_password)}
  DB_NAME: ${base64encode(var.db_name)}
  MERCADOPAGO_ACCESS_TOKEN: ${base64encode(var.mercadopago_access_token)}
  DATABASE_URL: ${base64encode("postgresql://${var.db_user}:${var.db_password}@${aws_db_instance.payments_db.address}:${aws_db_instance.payments_db.port}/${var.db_name}?schema=public")}
YAML
}