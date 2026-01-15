# language: pt
Funcionalidade: Entidade de Pagamento
  Como um sistema de pagamentos
  Eu quero gerenciar entidades de pagamento
  Para que eu possa processar transações financeiras

  Contexto:
    Dado que existe um pedido com ID "order-123"
    E o tipo de pagamento é "CREDIT_CARD"

  Cenário: Criar uma entidade de pagamento
    Quando eu crio uma nova entidade de pagamento
    Então o pagamento deve ter um ID definido
    E o pagamento deve ter o orderId "order-123"
    E o pagamento deve ter o tipo "CREDIT_CARD"
    E o pagamento deve ter um status indefinido
    E o pagamento deve ter o mercadoPagoPaymentId indefinido
    E o pagamento deve ter o qrCode indefinido
    E o pagamento deve ter uma data de criação
    E o pagamento deve ter uma data de atualização

  Cenário: Gerar UUID para o ID na criação
    Quando eu crio uma nova entidade de pagamento
    Então o ID deve ser uma string
    E o ID deve seguir o formato UUID v4

  Cenário: Permitir definir um novo ID
    Dado que existe um pagamento criado
    Quando eu defino o ID como "test-id-456"
    Então o ID do pagamento deve ser "test-id-456"

  Cenário: Retornar o ID do pagamento
    Dado que existe um pagamento criado
    Então o ID deve estar definido

  Cenário: Retornar o orderId do pagamento
    Dado que existe um pagamento criado
    Então o orderId deve estar definido

  Cenário: Retornar o status do pagamento
    Dado que existe um pagamento criado
    Então o status deve estar indefinido

  Cenário: Retornar a data de criação
    Dado que existe um pagamento criado
    Então a data de criação deve ser uma instância de Date

  Cenário: Retornar a data de atualização
    Dado que existe um pagamento criado
    Então a data de atualização deve ser uma instância de Date

  Cenário: Retornar o tipo do pagamento
    Dado que existe um pagamento criado
    Então o tipo deve estar definido

  Cenário: Retornar o mercadoPagoPaymentId
    Dado que existe um pagamento criado
    Então o mercadoPagoPaymentId deve estar indefinido

  Cenário: Retornar o qrCode
    Dado que existe um pagamento criado
    Então o qrCode deve estar indefinido

  Cenário: Definir mercadoPagoPaymentId
    Dado que existe um pagamento criado
    Quando eu defino o mercadoPagoPaymentId como "mp-123"
    Então o mercadoPagoPaymentId deve ser "mp-123"

  Cenário: Definir qrCode
    Dado que existe um pagamento criado
    Quando eu defino o qrCode como "qr-code"
    Então o qrCode deve ser "qr-code"

  Cenário: Atualizar orderId
    Dado que existe um pagamento criado
    Quando eu atualizo o orderId para "order-456"
    Então o orderId deve ser "order-456"

  Cenário: Atualizar tipo de pagamento
    Dado que existe um pagamento criado
    Quando eu atualizo o tipo para "PIX"
    Então o tipo deve ser "PIX"

  Cenário: Atualizar data de criação
    Dado que existe um pagamento criado
    Quando eu atualizo a data de criação para "2024-01-01"
    Então a data de criação deve ser "2024-01-01"

  Cenário: Atualizar data de atualização
    Dado que existe um pagamento criado
    Quando eu atualizo a data de atualização para "2024-02-01"
    Então a data de atualização deve ser "2024-02-01"

  Cenário: Atualizar ID customizado
    Dado que existe um pagamento criado
    Quando eu atualizo o ID para "custom-id"
    Então o ID deve ser "custom-id"

  Cenário: Atualizar status e refresh updatedAt
    Dado que existe um pagamento criado
    E eu registro a data de atualização atual
    Quando eu aguardo 1 milissegundo
    E eu atualizo o status para "APPROVED"
    Então o status deve ser "APPROVED"

  Cenário: Criar pagamento com tipo PIX
    Dado que o tipo de pagamento é "PIX"
    Quando eu crio uma nova entidade de pagamento
    Então o pagamento deve ter o tipo "PIX"
    E o pagamento deve ter um ID definido
    E o pagamento deve ter uma data de criação

  Cenário: Criar pagamento com tipo DEBIT_CARD
    Dado que o tipo de pagamento é "DEBIT_CARD"
    Quando eu crio uma nova entidade de pagamento
    Então o pagamento deve ter o tipo "DEBIT_CARD"
    E o pagamento deve ter um ID definido

  Cenário: Atualizar status para PENDING
    Dado que existe um pagamento criado
    Quando eu atualizo o status para "PENDING"
    Então o status deve ser "PENDING"

  Cenário: Atualizar status para REFUSED
    Dado que existe um pagamento criado
    Quando eu atualizo o status para "REFUSED"
    Então o status deve ser "REFUSED"

  Cenário: Atualizar status para EXPIRED
    Dado que existe um pagamento criado
    Quando eu atualizo o status para "EXPIRED"
    Então o status deve ser "EXPIRED"

  Cenário: Atualizar status para CANCELLED
    Dado que existe um pagamento criado
    Quando eu atualizo o status para "CANCELLED"
    Então o status deve ser "CANCELLED"

  Cenário: Definir mercadoPagoPaymentId como undefined
    Dado que existe um pagamento criado
    E o mercadoPagoPaymentId está definido como "mp-123"
    Quando eu defino o mercadoPagoPaymentId como undefined
    Então o mercadoPagoPaymentId deve estar indefinido

  Cenário: Definir qrCode como undefined
    Dado que existe um pagamento criado
    E o qrCode está definido como "qr-code-test"
    Quando eu defino o qrCode como undefined
    Então o qrCode deve estar indefinido

  Cenário: Múltiplas atualizações de status atualizam updatedAt
    Dado que existe um pagamento criado
    Quando eu atualizo o status para "PENDING"
    E eu aguardo 1 milissegundo
    E eu registro a data de atualização atual
    E eu aguardo 1 milissegundo
    E eu atualizo o status para "APPROVED"
    Então o status deve ser "APPROVED"
    E a data de atualização deve ser diferente da registrada

  Cenário: Criar pagamento com diferentes orderIds
    Dado que existe um pedido com ID "order-999"
    Quando eu crio uma nova entidade de pagamento
    Então o pagamento deve ter o orderId "order-999"
    E o pagamento deve ter um ID definido

  Cenário: Atualizar tipo de CREDIT_CARD para DEBIT_CARD
    Dado que existe um pagamento criado
    E o tipo de pagamento é "CREDIT_CARD"
    Quando eu atualizo o tipo para "DEBIT_CARD"
    Então o tipo deve ser "DEBIT_CARD"

  Esquema do Cenário: Criar pagamentos com diferentes tipos
    Dado que o tipo de pagamento é "<tipo>"
    Quando eu crio uma nova entidade de pagamento
    Então o pagamento deve ter o tipo "<tipo>"
    E o pagamento deve ter um ID definido

    Exemplos:
      | tipo         |
      | PIX          |
      | CREDIT_CARD  |
      | DEBIT_CARD   |

  Esquema do Cenário: Transições de status de pagamento
    Dado que existe um pagamento criado
    Quando eu atualizo o status para "<status>"
    Então o status deve ser "<status>"

    Exemplos:
      | status    |
      | APPROVED  |
      | PENDING   |
      | REFUSED   |
      | EXPIRED   |
      | CANCELLED |
