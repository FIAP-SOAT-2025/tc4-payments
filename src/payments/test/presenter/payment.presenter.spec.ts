import { PaymentPresenter } from '../../presenter/payment.presenter';
import { Payment, PaymentStatusEnum } from '../../domain/entities/payment.entity';
import { PaymentTypeEnum } from '../../domain/enums/payment-type.enum';

describe('PaymentPresenter', () => {
  it('should transform payment to complete response object', () => {
    const payment = new Payment('order-123', PaymentTypeEnum.PIX);
    payment.status = PaymentStatusEnum.PENDING;
    payment.mercadoPagoPaymentId = 'mp-123';
    payment.qrCode = 'qr-code-test';

    const response = PaymentPresenter.toResponse(payment);

    expect(response).toHaveProperty('id', payment.id);
    expect(response).toHaveProperty('orderId', 'order-123');
    expect(response).toHaveProperty('status', PaymentStatusEnum.PENDING);
    expect(response).toHaveProperty('type', PaymentTypeEnum.PIX);
    expect(response).toHaveProperty('mercadoPagoPaymentId', 'mp-123');
    expect(response).toHaveProperty('qrCode', 'qr-code-test');
    expect(response).toHaveProperty('createdAt');
    expect(response).toHaveProperty('updatedAt');
  });

  it('should handle payment with undefined id', () => {
    const payment = {
      orderId: 'order-456',
      status: PaymentStatusEnum.APPROVED,
      type: PaymentTypeEnum.CREDIT_CARD,
      mercadoPagoPaymentId: 'mp-456',
      qrCode: 'qr-code-456',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const response = PaymentPresenter.toResponse(payment);

    expect(response.id).toBe('');
    expect(response.orderId).toBe('order-456');
    expect(response.status).toBe(PaymentStatusEnum.APPROVED);
  });

  it('should handle payment with null id', () => {
    const payment = {
      id: null,
      orderId: 'order-789',
      status: PaymentStatusEnum.REFUSED,
      type: PaymentTypeEnum.DEBIT_CARD,
      mercadoPagoPaymentId: undefined,
      qrCode: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const response = PaymentPresenter.toResponse(payment);

    expect(response.id).toBe('');
    expect(response.orderId).toBe('order-789');
    expect(response.mercadoPagoPaymentId).toBeUndefined();
    expect(response.qrCode).toBeUndefined();
  });

  it('should preserve all payment types', () => {
    const types = [
      PaymentTypeEnum.PIX,
      PaymentTypeEnum.CREDIT_CARD,
      PaymentTypeEnum.DEBIT_CARD,
    ];

    types.forEach((type) => {
      const payment = new Payment('order-123', type);
      const response = PaymentPresenter.toResponse(payment);

      expect(response.type).toBe(type);
    });
  });

  it('should preserve all payment statuses', () => {
    const statuses = [
      PaymentStatusEnum.APPROVED,
      PaymentStatusEnum.PENDING,
      PaymentStatusEnum.REFUSED,
      PaymentStatusEnum.EXPIRED,
      PaymentStatusEnum.CANCELLED,
    ];

    statuses.forEach((status) => {
      const payment = new Payment('order-123', PaymentTypeEnum.PIX);
      payment.status = status;
      const response = PaymentPresenter.toResponse(payment);

      expect(response.status).toBe(status);
    });
  });

  it('should handle optional fields correctly', () => {
    const payment = new Payment('order-123', PaymentTypeEnum.PIX);

    const response = PaymentPresenter.toResponse(payment);

    expect(response.mercadoPagoPaymentId).toBeUndefined();
    expect(response.qrCode).toBeUndefined();
    expect(response.status).toBeUndefined();
  });
});
