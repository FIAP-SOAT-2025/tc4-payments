
resource "time_sleep" "wait_for_lb" {
  create_duration = "60s"
  depends_on      = [kubernetes_service.payments_service]
}


data "aws_lb" "payments_lb" {
  tags = {
    "kubernetes.io/service-name" = "lanchonete-payments/payments-service"
  }
  depends_on = [time_sleep.wait_for_lb]
}


data "aws_lb_listener" "payments_listener" {
  load_balancer_arn = data.aws_lb.payments_lb.arn
  port              = 80
}

data "terraform_remote_state" "db" {
  backend = "s3"
  config = {
    bucket = "terraform-state-tc3-g38-lanchonete-v1"
    key    = "db/terraform.tfstate"
    region = "us-east-1"
  }
}

data "terraform_remote_state" "infra" {
  backend = "s3"
  config = {
    bucket = "terraform-state-tc3-g38-lanchonete-v1"
    key    = "infra/terraform.tfstate"
    region = "us-east-1"
  }
}