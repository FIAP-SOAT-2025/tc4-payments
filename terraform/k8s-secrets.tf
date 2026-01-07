resource "kubectl_manifest" "secrets" {
  depends_on = [kubernetes_namespace.lanchonete_ns]
  yaml_body  = <<YAML
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
  namespace: tc4-payments
type: Opaque
data:
  DB_USER: ${base64encode(var.db_user)}
  DB_PASSWORD: ${base64encode(var.db_password)}
  DB_NAME: ${base64encode(var.db_name)}
  MERCADOPAGO_ACCESS_TOKEN: ${base64encode(var.mercadopago_access_token)}
  DATABASE_URL: ${base64encode("postgresql://${var.db_user}:${var.db_password}@${data.terraform_remote_state.db.outputs.db_instance_address}:${data.terraform_remote_state.db.outputs.db_instance_port}/${var.db_name}?schema=public")}
YAML
}