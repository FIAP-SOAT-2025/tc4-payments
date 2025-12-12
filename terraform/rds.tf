# ========================================
# RDS PostgreSQL para Payments
# ========================================

# Security Group para o RDS
resource "aws_security_group" "payments_db_sg" {
  name        = "payments-db-sg"
  description = "Security group for Payments RDS PostgreSQL"
  vpc_id      = data.terraform_remote_state.infra.outputs.vpc_id

  # Permite acesso do EKS ao RDS (PostgreSQL porta 5432)
  ingress {
    description     = "PostgreSQL from EKS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [data.terraform_remote_state.infra.outputs.eks_cluster_security_group_id]
  }

  # Permite todo tráfego de saída
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "payments-db-sg"
    Environment = "production"
    Service     = "payments"
  }
}

# Subnet Group para o RDS
resource "aws_db_subnet_group" "payments_db_subnet_group" {
  name       = "payments-db-subnet-group"
  subnet_ids = data.terraform_remote_state.infra.outputs.private_subnet_ids

  tags = {
    Name        = "payments-db-subnet-group"
    Environment = "production"
    Service     = "payments"
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "payments_db" {
  identifier = "payments-db"

  # Engine
  engine         = "postgres"
  engine_version = "15.4"

  # Instance
  instance_class        = "db.t3.micro"  # Free tier elegível
  allocated_storage     = 20             # GB
  max_allocated_storage = 100            # Auto scaling até 100GB
  storage_type          = "gp3"
  storage_encrypted     = true

  # Database
  db_name  = var.db_name
  username = var.db_user
  password = var.db_password

  # Network
  db_subnet_group_name   = aws_db_subnet_group.payments_db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.payments_db_sg.id]
  publicly_accessible    = false

  # Backup
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  # Performance
  multi_az               = false  # Para economizar (mude para true em produção)
  skip_final_snapshot    = true   # Cuidado: não cria snapshot ao deletar
  deletion_protection    = false  # Permite deletar (mude para true em produção)
  copy_tags_to_snapshot  = true
  auto_minor_version_upgrade = true

  # Monitoring
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  monitoring_interval             = 60
  monitoring_role_arn             = aws_iam_role.rds_monitoring_role.arn

  tags = {
    Name        = "payments-db"
    Environment = "production"
    Service     = "payments"
  }
}

# IAM Role para RDS Enhanced Monitoring
resource "aws_iam_role" "rds_monitoring_role" {
  name = "payments-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name    = "payments-rds-monitoring-role"
    Service = "payments"
  }
}

# Attach política de monitoring ao role
resource "aws_iam_role_policy_attachment" "rds_monitoring_policy" {
  role       = aws_iam_role.rds_monitoring_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}
