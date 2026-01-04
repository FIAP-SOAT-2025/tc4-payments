resource "kubernetes_service" "api_service_internal" {
  metadata {
    name      = "api-service-internal"
    namespace = "tc4-payment"
  }
  spec {
    selector = {
      app = "tc4-payment-api"
    }
    port {
      protocol    = "TCP"
      port        = 80
      target_port = 3000
    }
    type = "ClusterIP"
  }
  depends_on = [kubernetes_namespace.lanchonete_ns]
}