resource "kubectl_manifest" "configmap" {
  depends_on = [kubernetes_namespace.payments_ns]
  yaml_body  = <<YAML
apiVersion: v1
kind: ConfigMap
metadata:
  name: payments-configmap
  namespace: lanchonete-payments
data:
  API_BASE_URL: "https://api.mercadopago.com/v1/payments"
  NODE_TLS_REJECT_UNAUTHORIZED: "0"
  NODE_ENV: "production"
  PORT: "3000"

YAML
}