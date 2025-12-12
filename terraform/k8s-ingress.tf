resource "kubernetes_ingress_v1" "payments_ingress" {
  metadata {
    name      = "payments-ingress"
    namespace = "lanchonete-payments"
    annotations = {
      "kubernetes.io/ingress.class" : "alb",
      "alb.ingress.kubernetes.io/scheme" : "internal",
      "alb.ingress.kubernetes.io/target-type" : "ip"
    }
  }

  spec {
    rule {
      http {
        path {
          path      = "/*"
          path_type = "ImplementationSpecific"
          backend {
            service {
              name = kubernetes_service.payments_service.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }

  depends_on = [kubernetes_namespace.payments_ns]
}