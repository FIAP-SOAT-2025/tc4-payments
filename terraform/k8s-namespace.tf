resource "kubernetes_namespace" "payments_ns" {
  metadata {
    name = "lanchonete-payments"
  }
}