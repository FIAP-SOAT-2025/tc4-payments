resource "kubernetes_service" "payments_service" {
  metadata {
    name      = "payments-service"
    namespace = "lanchonete-payments"
    annotations = {
      "service.beta.kubernetes.io/aws-load-balancer-type" = "nlb"
    }
  }
  spec {
    selector = {
      app = "payments"
    }
    port {
      protocol    = "TCP"
      port        = 80
      target_port = 3000
    }
    type = "LoadBalancer"
  }
  depends_on = [kubernetes_namespace.payments_ns]
}