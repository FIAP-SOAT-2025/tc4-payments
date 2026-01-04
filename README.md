# 🍔 Sistema de Controle de Pedidos - Microsserviço de Pagamentos

> **Tech Challenge FIAP - Fase 04 


## 📚 Recursos

- [Collection Postman](https://drive.google.com/file/d/1ALtt8pY6O2XU1QKhaXTSMhZzP-9B-K7_/view?usp=sharing

### 

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#️-tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Linguagem Ubíqua](#-linguagem-ubíqua)
- [Desenho de requisitos do negócio](#️-requisitos-negócio)
- [Desenho da infraestrutura](#️-requisitos-infra)
- [Configuração](#️-configuração)
- [Execução](#️-execução)
- [Order de Execução](#️-ordem-execução)
- [Testes](#-testes)
- [Equipe](#-equipe)

---

## Visão Geral

O microsserviço de Pagamentos é responsável por gerenciar todo o ciclo de vida dos pagamentos no sistema FIAP Fast Food. Ele integra-se com o **Mercado Pago** para processamento de pagamentos PIX e notifica o microsserviço de Pedidos sobre mudanças de status.

### Funcionalidades Principais

- Criação de pagamentos e geração de QR Code PIX
- Integração com Mercado Pago para processamento de pagamentos
- Webhook para receber atualizações de status de pagamento
- Notificação do microsserviço de Pedidos sobre mudanças de status
- Validação de transições de status de pagamento

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

## 🛠️ Tecnologias
### Core Framework

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| **Linguagem** | TypeScript | 5.7.3 |
| **Framework** | NestJS | 11.0.1 |
| **Runtime** | Node.js | 22 |

### Banco de Dados

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| **Banco de Dados** | PostgreSQL | 15 |
| **ORM** | Prisma | 6.18.0 |

### Integrações Externas

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| **Pagamentos** | Mercado Pago SDK | 2.7.0 |
| **HTTP Client** | Axios (via @nestjs/axios) | 4.0.0 |

### Testes

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| **Framework de Testes** | Jest | 29.7.0 |
| **TypeScript Preprocessor** | ts-jest | 29.2.5 |
| **Testes de Integração** | Supertest | 7.0.0 |
| **Cobertura Mínima** | Branches, Functions, Lines, Statements | 80% |

### Containerização
| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| **Containerização** | Docker & Docker Compose | Latest |

---

## Estrutura do Projeto

```
tc4-payments/
├── src/
│   ├── payments/                    # Módulo Principal (Clean Architecture)
│   │   ├── domain/                  # Regras de Negócio
│   │   │   ├── entities/            # Entidades (Payment)
│   │   │   └── enums/               # Enumeradores (Status, Tipos)
│   │   ├── usecases/                # Casos de Uso
│   │   ├── gateways/                # Implementação de Gateways
│   │   ├── interfaces/              # Contratos/Portas
│   │   ├── infrastructure/          # Adaptadores
│   │   │   ├── api/                 # Controllers & DTOs
│   │   │   ├── persistence/         # Repositório Prisma
│   │   │   └── external/            # Clientes (MercadoPago, Order)
│   │   ├── controllers/             # Controllers NestJS
│   │   ├── presenter/               # Formatação de Respostas
│   │   └── test/                    # Testes Unitários
│   ├── shared/                      # Utilitários
│   │   ├── exceptions/              # Tratamento de Erros
│   │   └── infra/                   # Serviços (Prisma)
│   ├── health/                      # Health Check
│   ├── app.module.ts                # Módulo Raiz
│   └── main.ts                      # Bootstrap
├── prisma/                          # ORM & Banco de Dados
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── terraform/                       # IaC Kubernetes
├── .github/workflows/               # CI/CD
│   ├── ci.yml                       # Testes
│   ├── build-and-deploy.yml         # Docker Build
│   ├── terraform.yml                # Deploy K8s
│   └── sonar.yml                    # Code Quality
├── docker-compose.yml
├── Dockerfile
└── package.json

```

---

## 📖 Linguagem Ubíqua

### Status do pagamento

#### PaymentStatus
- `APPROVED` - Pagamento aprovado
- `PENDING` - Aguardando processamento
- `REFUSED` - Pagamento recusado
- `EXPIRED` - Pagamento expirado
- `CANCELLED` - Pagamento cancelado

## Pré-requisitos

- **Docker** e **Docker Compose** instalados ([Guia de instalação](https://docs.docker.com/get-started/get-docker/))
- **Git** para clonar o repositório

## ⚙️ Configuração
### Clonar Repositório do projeto
```bash
# 1. Clonar o repositório
git clone git@github.com:FIAP-SOAT-2025/tc4-payments.git
cd tc4-payments
```
### Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env
```

Popular as seguintes variáveis do arquivo `.env` para utilizar setup local:

```env
DATABASE_URL=
DB_USER=
DB_PASSWORD= 
DB_NAME= 
API_BASE_URL=
ACCESS_TOKEN= 


```
### IMPORTANTE!
A env ACCESS_TOKEN é de necessária para a conexão com a API do Mercado Pago, e seu valor estará no [Drive do Projeto](https://docs.google.com/document/d/1VSRjj57Eax54N8XnDkh8X8qgpX06bfv8/edit#heading=h.57tg4az9s2oq)
```env
ACCESS_TOKEN = 
```

## Opção 1: Setup Completo com Docker (Recomendado)

```bash
# 1. Subir todos os serviços
docker-compose up
```

## Opção 2: Setup Local (Desenvolvimento)

```bash
# 1.Instalar dependências
npm install

# 3. Subir apenas o banco de dados
docker-compose up db -d
```

---



### Setup do Banco de Dados

```bash
# Executar migrações e popular dados iniciais
npx prisma migrate dev --name init
npm run seed
```

---

## Opção 3: Setup Kubernetes local com kind
[Testando o Ambiente Kubernetes Localmente com Kind](/kind/README.md)

## ▶️ Execução

### Desenvolvimento
```bash
npm run start:dev
```

### Acesso à Aplicação
- **API:** http://localhost:3000
- **Swagger:** http://localhost:3000/api

---

## 🧪 Testes

```bash
# Todos os testes
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

---

## 👥 Equipe

| Nome | RM |
|------|-----|
| **Daniela Rêgo Lima de Queiroz** | RM361289 |
| **Diana Bianca Santos Rodrigues** | RM361570 |
| **Felipe Alves Teixeira** | RM362585 |
| **Luiz Manoel Resplande Oliveira** | RM363920 |
| **Thaís Lima de Oliveira Nobre** | RM362744 |

---

## 📝 Licença

Este projeto foi desenvolvido como parte do Tech Challenge da FIAP - Pós-graduação em Software Architecture.

