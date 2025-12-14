output "payments_service_name" {
  description = "Nome do service do Payments"
  value       = "payments-service"
}

output "payments_namespace" {
  description = "Namespace do Payments"
  value       = "lanchonete-payments"
}

output "payments_listener_arn" {
  description = "The ARN of the NLB Listener for the Payments service."
  value       = data.aws_lb_listener.payments_listener.arn
}

output "payments_load_balancer_hostname" {
  description = "The public hostname of the Payments Network Load Balancer."
  value       = kubernetes_service.payments_service.status[0].load_balancer[0].ingress[0].hostname
}

# ========================================
# RDS Outputs
# ========================================

output "db_instance_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.payments_db.endpoint
}

output "db_instance_address" {
  description = "The hostname of the RDS instance"
  value       = aws_db_instance.payments_db.address
}

output "db_instance_port" {
  description = "The port of the RDS instance"
  value       = aws_db_instance.payments_db.port
}

output "db_instance_name" {
  description = "The database name"
  value       = aws_db_instance.payments_db.db_name
}

output "db_instance_id" {
  description = "The RDS instance ID"
  value       = aws_db_instance.payments_db.id
}