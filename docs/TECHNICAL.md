# Microsserviço de Pagamentos - Documentação Técnica

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Endpoints da API](#endpoints-da-api)
6. [Comunicação com Outros Microsserviços](#comunicação-com-outros-microsserviços)
7. [Decisões Arquiteturais](#decisões-arquiteturais)
8. [Infraestrutura e Deploy](#infraestrutura-e-deploy)

---

## Visão Geral

O microsserviço de Pagamentos é responsável por gerenciar todo o ciclo de vida dos pagamentos no sistema FIAP Fast Food. Ele integra-se com o **Mercado Pago** para processamento de pagamentos PIX e notifica o microsserviço de Pedidos sobre mudanças de status.

### Funcionalidades Principais

- Criação de pagamentos e geração de QR Code PIX
- Integração com Mercado Pago para processamento de pagamentos
- Webhook para receber atualizações de status de pagamento
- Notificação do microsserviço de Pedidos sobre mudanças de status
- Validação de transições de status de pagamento
- Health check para monitoramento Kubernetes

### Contexto no Sistema

Este microsserviço faz parte de uma arquitetura de microsserviços para um sistema de Fast Food, atuando como intermediário entre o fluxo de pedidos e o processamento de pagamentos externos.

---

## Arquitetura

### Padrão Arquitetural: Clean Architecture (Hexagonal)

O projeto segue os princípios da **Clean Architecture**, garantindo separação clara de responsabilidades e independência de frameworks externos.

```
┌─────────────────────────────────────────────────────────────┐
│                     Infrastructure Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  REST API    │  │  Prisma      │  │  External APIs   │  │
│  │  (NestJS)    │  │  Repository  │  │  (MP, Orders)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Application Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Gateways   │  │  Use Cases   │  │   Controllers    │  │
│  │  (Adapters)  │  │  (Business)  │  │  (Orchestrator)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      Domain Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Entities   │  │    Enums     │  │   Interfaces     │  │
│  │   (Models)   │  │   (States)   │  │    (Ports)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Camadas da Arquitetura

#### 1. **Domain Layer** (Núcleo de Negócio)
- **Entities**: Modelo `Payment` com regras de negócio
- **Enums**: `PaymentStatusEnum`, `PaymentTypeEnum`, `OrderStatusEnum`
- **Interfaces**: Contratos que definem portas (`PaymentGatewayInterface`, `CallPaymentProviderGatewayInterface`, `OrderGatewayInterface`)
- **Características**: Sem dependências externas, lógica de negócio pura

#### 2. **Application Layer** (Casos de Uso)
- **Use Cases**:
  - `CreatePaymentUseCase`: Orquestra criação de pagamento
  - `WebhookUpdatePaymentStatusUseCase`: Processa atualizações de status
  - `ValidateStatusUseCase`: Valida transições de status
- **Gateways**: Implementam interfaces do domínio
- **Controllers**: Orquestram fluxo entre use cases

#### 3. **Infrastructure Layer** (Adaptadores)
- **API**: Controllers REST com validação de DTOs
- **Persistence**: `PrismaPaymentRepository` para acesso ao banco
- **External Clients**:
  - `MercadoPagoClient`: Integração com Mercado Pago
  - `OrderClient`: Comunicação com microsserviço de Pedidos
- **Presenters**: Formatação de respostas (`PaymentPresenter`, `CheckoutPresenter`)

---

## Stack Tecnológica

### Core Framework
- **NestJS** (v11.0.1) - Framework progressivo para Node.js
- **Node.js** (v22) - Runtime JavaScript
- **TypeScript** (v5.7.3) - Linguagem tipada

### Banco de Dados
- **PostgreSQL** (v15) - Banco relacional
- **Prisma** (v6.18.0) - ORM moderno para TypeScript/Node.js

### Integrações Externas
- **Mercado Pago SDK** (v2.7.0) - Processamento de pagamentos
- **Axios** (via @nestjs/axios v4.0.0) - Cliente HTTP

### Validação e Documentação
- **class-validator** (v0.14.2) - Validação de DTOs
- **class-transformer** (v0.5.1) - Transformação de objetos
- **@nestjs/swagger** (v11.2.0) - Documentação OpenAPI/Swagger

### Testes
- **Jest** (v29.7.0) - Framework de testes
- **ts-jest** (v29.2.5) - Preprocessor TypeScript
- **Supertest** (v7.0.0) - Testes de integração HTTP
- **Cobertura Mínima**: 80% (branches, functions, lines, statements)

### Utilitários
- **@nestjs/event-emitter** (v3.0.1) - Sistema de eventos
- **@brazilian-utils/brazilian-utils** (v1.0.0-rc.12) - Validação de dados brasileiros

---

## Estrutura do Projeto

```
tc4-payments/
├── src/
│   ├── payments/                          # Módulo de Pagamentos
│   │   ├── domain/                        # Camada de Domínio
│   │   │   ├── entities/
│   │   │   │   └── payment.entity.ts      # Entidade Payment
│   │   │   └── enums/
│   │   │       ├── payment-status.enum.ts # Estados de pagamento
│   │   │       ├── payment-type.enum.ts   # Tipos de pagamento
│   │   │       └── order-status.enum.ts   # Estados de pedido
│   │   ├── usecases/                      # Casos de Uso
│   │   │   ├── createPayment.usecase.ts
│   │   │   ├── webhookUpdatePaymentStatus.usecase.ts
│   │   │   └── validateStatus.usecase.ts
│   │   ├── gateways/                      # Implementação de Gateways
│   │   │   ├── payment.gateway.ts
│   │   │   ├── payment-provider.gateway.ts
│   │   │   └── order-provider.gateway.ts
│   │   ├── interfaces/                    # Contratos (Portas)
│   │   │   ├── payment-gateway.interface.ts
│   │   │   ├── call-payment-provider-gateway.interface.ts
│   │   │   └── order-gateway.interface.ts
│   │   ├── infrastructure/                # Adaptadores Externos
│   │   │   ├── api/
│   │   │   │   ├── controllers/
│   │   │   │   │   └── payment.api.ts     # REST Controllers
│   │   │   │   └── dto/
│   │   │   │       ├── create-checkout.dto.ts
│   │   │   │       └── update-status.dto.ts
│   │   │   ├── persistence/
│   │   │   │   └── prismaPayment.repository.ts
│   │   │   └── external/
│   │   │       ├── mercado-pago/
│   │   │       │   └── mercado-pago.client.ts
│   │   │       └── order/
│   │   │           └── order.client.ts
│   │   ├── controllers/
│   │   │   └── payment.controller.ts
│   │   ├── presenter/
│   │   │   ├── payment.presenter.ts
│   │   │   └── checkout.presenter.ts
│   │   └── test/                          # Testes Unitários
│   ├── shared/                            # Utilitários Compartilhados
│   │   ├── exceptions/
│   │   │   ├── exceptions.base.ts
│   │   │   └── exception.mapper.ts
│   │   └── infra/
│   │       └── prisma.service.ts
│   ├── health/
│   │   └── health.controller.ts           # Health Check
│   ├── app.module.ts                      # Módulo Raiz
│   └── main.ts                            # Ponto de Entrada
├── prisma/
│   ├── schema.prisma                      # Schema do Banco
│   ├── seed.ts                            # Seed de Dados
│   └── migrations/                        # Migrações
├── terraform/                             # Infrastructure as Code
│   ├── k8s-deployment.tf
│   ├── k8s-service.tf
│   ├── k8s-ingress.tf
│   ├── k8s-secrets.tf
│   ├── k8s-configmap.tf
│   ├── k8s-db-migrate-job.tf
│   └── k8s-namespace.tf
├── .github/
│   └── workflows/                         # CI/CD Pipelines
│       ├── ci.yml                         # Testes
│       ├── build-and-deploy.yml           # Build Docker
│       ├── terraform.yml                  # Deploy Kubernetes
│       └── sonar.yml                      # Análise de Código
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## Endpoints da API

**Base URL**: `http://localhost:3000`
**Documentação Swagger**: `http://localhost:3000/api`

### 1. Criar Pagamento e Gerar QR Code

```http
POST /payment/checkout
```

**Descrição**: Cria um novo pagamento e gera QR Code PIX via Mercado Pago.

**Request Body**:
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "customer_email": "cliente@email.com",
  "amount": 50.00
}
```

**Validações**:
- `orderId`: UUID válido, obrigatório
- `customer_email`: Email válido, obrigatório
- `amount`: Número positivo, obrigatório

**Response (201 Created)**:
Retorna ID do pagamento e status
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "status": "PENDING"
}
```

**Erros Possíveis**:
- `400 Bad Request`: Dados inválidos
- `500 Internal Server Error`: Erro na integração com Mercado Pago

---

### 2. Webhook de Atualização de Status

```http
PATCH /payment/webhook/status/:id
```

**Descrição**: Endpoint webhook para o Mercado Pago notificar mudanças de status de pagamento.

**Path Parameters**:
- `id`: UUID do pagamento

**Request Body**:
```json
{
  "status": "APPROVED"
}
```

**Validações**:
- `status`: Deve ser um dos valores: `APPROVED`, `PENDING`, `REFUSED`, `EXPIRED`, `CANCELLED`

**Response (200 OK)**:
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "APPROVED",
  "type": "PIX",
  "mercadoPagoPaymentId": "123456789",
  "qrCode": "00020126580014br.gov.bcb.pix...",
  "createdAt": "2025-01-04T10:00:00.000Z",
  "updatedAt": "2025-01-04T10:05:00.000Z"
}
```

**Mapeamento de Status** (Payment → Order):
| Status Payment | Status Order |
|----------------|--------------|
| APPROVED       | RECEIVED     |
| REFUSED        | CANCELLED    |
| EXPIRED        | CANCELLED    |
| CANCELLED      | CANCELLED    |
| PENDING        | PENDING      |

**Erros Possíveis**:
- `400 Bad Request`: Transição de status inválida
- `404 Not Found`: Pagamento não encontrado
- `500 Internal Server Error`: Erro ao notificar serviço de Pedidos

---

### 3. Health Check

```http
GET /health
```

**Descrição**: Endpoint de verificação de saúde para probes do Kubernetes.

**Response (200 OK)**:
```json
{
  "status": "ok"
}
```

**Uso**: Configurado como readiness e liveness probe no Kubernetes.

---


## Comunicação com Outros Microsserviços

### 1. Integração com Microsserviço de Pedidos (Orders)

**Tipo**: Comunicação Síncrona HTTP
**Arquivo**: [src/payments/infrastructure/external/order/order.client.ts](src/payments/infrastructure/external/order/order.client.ts)

**Endpoint Chamado**:
```http
PATCH {API_BASE_URL}/order/payment-status/:orderId
```

**Request Payload**:
```json
{
  "status": "RECEIVED" | "CANCELLED" | "PENDING"
}
```

**Quando é Chamado**:
- Após cada atualização de status de pagamento via webhook
- Usado para sincronizar estado entre pagamentos e pedidos

**Mapeamento de Status**:
```typescript
Payment APPROVED  → Order RECEIVED
Payment REFUSED   → Order CANCELLED
Payment EXPIRED   → Order CANCELLED
Payment CANCELLED → Order CANCELLED
Payment PENDING   → Order PENDING
```

---

### 2. Integração com Mercado Pago (Payment Provider)

**Tipo**: API REST Externa
**Arquivo**: [src/payments/infrastructure/external/mercado-pago/mercado-pago.client.ts](src/payments/infrastructure/external/mercado-pago/mercado-pago.client.ts)

**Endpoint**:
```
POST https://api.mercadopago.com/v1/payments
```

**Autenticação**:
```
Authorization: Bearer {MERCADOPAGO_ACCESS_TOKEN}
```

**Headers**:
```
Content-Type: application/json
X-Idempotency-Key: {UUID}  // Previne pagamentos duplicados
```

**Request Body**:
```json
{
  "transaction_amount": 50.00,
  "description": "FIAP Fast Food Payment",
  "payment_method_id": "pix",
  "payer": {
    "email": "cliente@email.com"
  }
}
```

**Response Utilizada**:
```json
{
  "id": "123456789",
  "status": "pending",
  "point_of_interaction": {
    "transaction_data": {
      "qr_code": "00020126580014br.gov.bcb.pix..."
    }
  }
}
```

**Dados Armazenados**:
- `id`: Salvo como `mercadoPagoPaymentId`
- `status`: Mapeado para `PaymentStatusEnum`
- `qr_code`: Armazenado no campo `qrCode`

**Idempotência**:
- Cada chamada usa header `X-Idempotency-Key` com UUID único
- Previne criação de pagamentos duplicados em caso de retry

---

### Diagrama de Comunicação

```
┌──────────────────┐
│   Frontend/API   │
└────────┬─────────┘
         │ POST /payment/checkout
         ▼
┌─────────────────────────────┐
│  Payments Microservice      │
│                             │
│  ┌─────────────────────┐   │
│  │ CreatePaymentUseCase│   │
│  └──────┬──────────────┘   │
│         │                   │
│         ├─────────────────────────────┐
│         │                             │
│         ▼                             ▼
│  ┌──────────────┐          ┌──────────────────┐
│  │ Save to DB   │          │ Mercado Pago API │
│  │  (Prisma)    │          │   (External)     │
│  └──────────────┘          └──────────────────┘
└─────────────────────────────┘
         ▲
         │ PATCH /webhook/status/:id
         │ (Mercado Pago callback)
         │
┌─────────────────────────────┐
│  Payments Microservice      │
│                             │
│  ┌──────────────────────┐  │
│  │WebhookUpdateStatus   │  │
│  │      UseCase         │  │
│  └──────┬───────────────┘  │
│         │                   │
│         ├─────────────────────────────┐
│         │                             │
│         ▼                             ▼
│  ┌──────────────┐          ┌──────────────────┐
│  │ Update DB    │          │  Orders Service  │
│  │  (Prisma)    │          │ PATCH /order/... │
│  └──────────────┘          └──────────────────┘
└─────────────────────────────┘
```

---

## Decisões Arquiteturais

### 1. Clean Architecture / Hexagonal Architecture

**Decisão**: Adotar Clean Architecture com separação em camadas (Domain, Application, Infrastructure).

**Razão**:
- **Testabilidade**: Lógica de negócio independente de frameworks
- **Manutenibilidade**: Mudanças em uma camada não afetam outras
- **Flexibilidade**: Fácil substituição de providers (ex: trocar Mercado Pago por Stripe)
- **Independência de Framework**: Core business não depende do NestJS

**Impacto**:
- Estrutura de pastas mais complexa
- Curva de aprendizado inicial maior
- Menos código acoplado a longo prazo

---

### 2. Gateway Pattern

**Decisão**: Utilizar gateways como camada de abstração entre use cases e infraestrutura.

**Implementação**:
```typescript
// Interface (Port)
interface CallPaymentProviderGatewayInterface {
  createPayment(data: CreatePaymentDto): Promise<PaymentResponseDto>;
}

// Implementação (Adapter)
class MercadoPagoClient implements CallPaymentProviderGatewayInterface {
  async createPayment(data: CreatePaymentDto) {
    // Implementação específica Mercado Pago
  }
}
```

**Razão**:
- Inversão de dependência (use cases dependem de interfaces)
- Fácil mockar em testes
- Permite trocar implementação sem alterar casos de uso

---

### 3. Repository Pattern com Prisma

**Decisão**: Criar `PrismaPaymentRepository` que implementa `PaymentGatewayInterface`.

**Razão**:
- Abstração da tecnologia de persistência
- Facilita testes (mock do repository)
- Possibilidade de trocar ORM no futuro sem impactar casos de uso

**Trade-off**:
- Camada extra de abstração
- Menos uso direto das features do Prisma

---

### 4. DTO + Presenter Pattern

**Decisão**: DTOs para entrada (com validação), Presenters para formatação de saída.

**Exemplo**:
```typescript
// DTO (Input)
class CreateCheckoutDto {
  @IsUUID()
  orderId: string;

  @IsEmail()
  customer_email: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}

// Presenter (Output)
class CheckoutPresenter {
  static toHttp(payment: Payment) {
    return {
      id: payment.id,
      status: payment.status
    };
  }
}
```

**Razão**:
- Validação automática via `class-validator`
- Separação entre modelo de domínio e contratos de API
- Controle sobre dados expostos publicamente

---

### 5. Desacoplamento de Serviços

**Decisão**: Cada microsserviço tem seu próprio banco de dados. Sem foreign keys entre serviços.

**Razão**:
- Autonomia de cada serviço
- Evita acoplamento de dados
- Cada serviço pode evoluir independentemente
- Segue padrão de Database per Service

**Trade-off**:
- Consistência eventual (não imediata)
- Necessidade de comunicação inter-serviços para sincronização

---

### 6. Idempotência em Chamadas Externas

**Decisão**: Uso de `X-Idempotency-Key` (UUID) nas chamadas ao Mercado Pago.

**Razão**:
- Previne criação de pagamentos duplicados em caso de retry
- Segurança em ambientes distribuídos
- Conformidade com boas práticas de APIs externas

---

### 7. Status Enum Centralizado

**Decisão**: Enums para estados de pagamento e pedidos definidos no domínio.

**Razão**:
- Single source of truth para estados válidos
- Type safety em TypeScript
- Facilita validação de transições de estado

**Enums**:
```typescript
enum PaymentStatusEnum {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REFUSED = 'REFUSED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

enum PaymentTypeEnum {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD'
}
```

---

### 8. Logging Estratégico

**Decisão**: Logs em pontos críticos (criação, atualização, chamadas externas).

**Razão**:
- Rastreabilidade de transações
- Debugging em produção
- Auditoria de mudanças de status

---

### 9. Health Check para Kubernetes

**Decisão**: Endpoint `/health` dedicado para probes.

**Razão**:
- Integração com Kubernetes readiness/liveness probes
- Alta disponibilidade (pods não saudáveis são reiniciados)
- Monitoramento simplificado

---

## Infraestrutura e Deploy

### Orquestração de Containers: Kubernetes (AWS EKS)

**Cluster**: `eks-tc4-lanchonete-v1-v1`
**Região**: `us-east-1`
**Namespace**: `tc4-payments`

---

### Recursos Kubernetes

#### 1. Deployment

**Arquivo**: [terraform/k8s-deployment.tf](terraform/k8s-deployment.tf)

**Configuração**:
```yaml
replicas: 1
image: dianabianca/tc4-payments:latest
container_port: 3000

resources:
  requests:
    memory: 512Mi
    cpu: 250m
  limits:
    memory: 1Gi
    cpu: 500m

readinessProbe:
  path: /health
  initialDelaySeconds: 15
  periodSeconds: 5

livenessProbe:
  path: /health
  initialDelaySeconds: 30
  periodSeconds: 10
```

**Environment Variables**: Carregadas de ConfigMap e Secrets

---

#### 2. Service (LoadBalancer)

**Arquivo**: [terraform/k8s-service.tf](terraform/k8s-service.tf)

```yaml
type: LoadBalancer
annotations:
  service.beta.kubernetes.io/aws-load-balancer-type: nlb
ports:
  - port: 80
    targetPort: 3000
```

**Network Load Balancer (NLB)**: Provisionado automaticamente na AWS

---

#### 3. Ingress (ALB)

**Arquivo**: [terraform/k8s-ingress.tf](terraform/k8s-ingress.tf)

```yaml
ingressClassName: alb
annotations:
  alb.ingress.kubernetes.io/scheme: internal
  alb.ingress.kubernetes.io/target-type: ip
rules:
  - path: /*
    pathType: ImplementationSpecific
```

---

#### 4. Secrets

**Arquivo**: [terraform/k8s-secrets.tf](terraform/k8s-secrets.tf)

**Secrets Armazenados**:
- `DB_USER`: Usuário do banco PostgreSQL
- `DB_PASSWORD`: Senha do banco
- `DB_NAME`: Nome do banco
- `DATABASE_URL`: String de conexão completa
- `MERCADOPAGO_ACCESS_TOKEN`: Token de acesso Mercado Pago

**Gerenciamento**: Armazenados como Kubernetes Secrets (base64 encoded)

---

#### 5. ConfigMap

**Arquivo**: [terraform/k8s-configmap.tf](terraform/k8s-configmap.tf)

```yaml
data:
  NODE_TLS_REJECT_UNAUTHORIZED: "0"
```

---

#### 6. Database Migration Job

**Arquivo**: [terraform/k8s-db-migrate-job.tf](terraform/k8s-db-migrate-job.tf)

**Propósito**: Executar migrações Prisma antes do deploy

```yaml
command:
  - /bin/sh
  - -c
  - npx prisma migrate deploy && npx prisma db seed

resources:
  requests:
    memory: 256Mi
    cpu: 100m

restartPolicy: Never
backoffLimit: 4
```

**Fluxo**:
1. Job executado antes do deployment da aplicação
2. Aplica migrações pendentes
3. Executa seed de dados (se necessário)
4. Pod finaliza após conclusão

---

### Database (AWS RDS PostgreSQL)

**Gerenciamento**: Terraform separado (state: `db/terraform.tfstate`)

**Conexão**: Via `DATABASE_URL` secret

**Schema**: Definido em [prisma/schema.prisma](prisma/schema.prisma)

```prisma
model Payment {
  id                    String            @id @default(uuid())
  orderId               String
  status                PaymentStatusEnum @default(PENDING)
  type                  PaymentTypeEnum
  mercadoPagoPaymentId  String?
  qrCode                String?
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt

  @@index([status])
}
```

---

### Terraform Configuration

**Backend**: S3 bucket `terraform-state-tc4-lanchonete`
**State Key**: `payments/terraform.tfstate`
**Lock**: DynamoDB (para state locking)

**Dependências Externas** (Remote State):
```hcl
data "terraform_remote_state" "infra" {
  backend = "s3"
  config = {
    bucket = "terraform-state-tc4-lanchonete"
    key    = "infra/terraform.tfstate"
    region = "us-east-1"
  }
}

data "terraform_remote_state" "db" {
  backend = "s3"
  config = {
    bucket = "terraform-state-tc4-lanchonete"
    key    = "db/terraform.tfstate"
    region = "us-east-1"
  }
}
```

---

### Docker Configuration

**Arquivo**: [Dockerfile](Dockerfile)

```dockerfile
FROM node:22-bullseye

WORKDIR /home/node/fiap_g38/app

COPY package*.json ./
COPY . .

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/src/main"]
```

**Multi-Stage Build**: Não (otimização futura possível)

---

### CI/CD Pipelines (GitHub Actions)

#### 1. Tests & Coverage

**Arquivo**: [.github/workflows/ci.yml](.github/workflows/ci.yml)

**Trigger**: Pull requests para `main`

**Steps**:
1. Checkout código
2. Setup Node.js 20
3. Install dependencies
4. Run tests com coverage
5. Validar threshold 80%

---

#### 2. Build & Push Docker Image

**Arquivo**: [.github/workflows/build-and-deploy.yml](.github/workflows/build-and-deploy.yml)

**Trigger**: Push para `main` (apenas se houver mudanças em `src/**`)

**Steps**:
1. Checkout código
2. Login no Docker Hub
3. Build imagem Docker
4. Tag: `dianabianca/payment:latest`
5. Push para Docker Hub
6. Cache de layers para builds futuros

---

#### 3. Terraform Deploy

**Arquivo**: [.github/workflows/terraform.yml](.github/workflows/terraform.yml)

**Trigger**:
- Push para `main`
- Pull request para `main`
- Manual (workflow_dispatch)

**Jobs**:

**Job 1: check-dependencies**
- Valida que cluster EKS existe
- Verifica remote states

**Job 2: terraform-apply**
- Configure AWS credentials
- Setup kubectl para EKS
- Terraform init/plan/apply
- Wait for pod readiness
- Extract LoadBalancer URL
- Health check verification
- Output deployment info

**Job 3: terraform-destroy** (manual)
- Permite destruir recursos via workflow dispatch

**Environment**: `production`

---

#### 4. Code Quality (SonarCloud)

**Arquivo**: [.github/workflows/sonar.yml](.github/workflows/sonar.yml)

**Trigger**: Push/PR para `main`

**Steps**:
1. Run tests com coverage
2. Upload coverage para SonarCloud
3. Análise de código estático
4. Quality Gate validation

**Threshold**: 70% coverage
**Exclusions**: `node_modules/`, `dist/`, `**/*.spec.ts`

---

### Variáveis de Ambiente Necessárias

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
DB_USER=payments_user
DB_PASSWORD=secure_password
DB_NAME=payments_db

# External Services
API_BASE_URL=http://orders-service/api  # URL do serviço de pedidos
MERCADOPAGO_ACCESS_TOKEN=your_mp_token

# Application
PORT=3000
NODE_TLS_REJECT_UNAUTHORIZED=0  # Apenas dev/staging
```

---

### Fluxo de Deploy Completo

```
1. Developer push para main
   ↓
2. GitHub Actions: ci.yml (tests)
   ↓ (se passar)
3. GitHub Actions: build-and-deploy.yml
   - Build Docker image
   - Push para Docker Hub
   ↓
4. GitHub Actions: terraform.yml
   - Terraform plan
   - Terraform apply
   ↓
5. Kubernetes: db-migrate-job
   - Prisma migrate deploy
   - Prisma db seed
   ↓
6. Kubernetes: Deployment
   - Pull image: dianabianca/tc4-payments:latest
   - Create pods (1 replica)
   - Readiness probe: /health
   ↓
7. Kubernetes: Service (NLB)
   - Expose pods na porta 80
   ↓
8. Application Ready
   - Health check OK
   - LoadBalancer URL available
```

---


## 🧪 Cobertura de Testes

#### Cobertura acima de 70% no SonarQube
![Cobertura SonarQube](./evidences/payments-sonar.png)

#### Cobertura acima de 80% no Microsserviço de Payments
![Cobertura no Projeto](./evidences/coverage-payments.png)

#### Validação de corbertura de testes e review para liberar o merge
![Validação](./evidences/github-validations.png)