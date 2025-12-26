import {
  Payment,
  PaymentStatusEnum,
} from '../../../domain/entities/payment.entity';
import { PaymentTypeEnum } from '../../../domain/enums/payment-type.enum';

describe('Payment Entity - id property', () => {
  it('should generate a UUID for id on creation', () => {
    const payment = new Payment('order-123', PaymentTypeEnum.CREDIT_CARD);
    expect(typeof payment.id).toBe('string');
    expect(payment.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('should allow setting a new id', () => {
    const payment = new Payment('order-123', PaymentTypeEnum.CREDIT_CARD);
    const newId = 'test-id-456';
    payment.id = newId;
    expect(payment.id).toBe(newId);
  });
});

describe('Payment Entity', () => {
  let payment: Payment;

  beforeEach(() => {
    payment = new Payment('order-123', PaymentTypeEnum.CREDIT_CARD);
  });

  it('should create a Payment entity', () => {
    const result = new Payment(payment.orderId, PaymentTypeEnum.CREDIT_CARD);
    expect(result.id).toBeDefined();
    expect(result.orderId).toBe(payment.orderId);
    expect(result).toHaveProperty('_orderId', payment.orderId);
    expect(result).toHaveProperty('_type', payment.type);

    expect(result).toHaveProperty('_status', payment.status);
    expect(result).toHaveProperty(
      '_mercadoPagoPaymentId',
      payment.mercadoPagoPaymentId,
    );
    expect(result).toHaveProperty('_qrCode', payment.qrCode);

    expect(result).toHaveProperty('_createdAt');
    expect(result.createdAt).toBeInstanceOf(Date);

    expect(result).toHaveProperty('_updatedAt');
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result).toBeDefined();
  });

  it('should return id', () => {
    expect(payment.id).toBeDefined();
  });

  it('should return orderId', () => {
    expect(payment.orderId).toBeDefined();
  });

  it('should return status', () => {
    expect(payment.status).toBeUndefined();
  });

  it('should return createdAt', () => {
    expect(payment.createdAt).toBeInstanceOf(Date);
  });

  it('should return updatedAt', () => {
    expect(payment.updatedAt).toBeInstanceOf(Date);
  });

  it('should return type', () => {
    expect(payment.type).toBeDefined();
  });

  it('should return mercadoPagoPaymentId', () => {
    expect(payment.mercadoPagoPaymentId).toBeUndefined();
  });

  it('should return qrCode', () => {
    expect(payment.qrCode).toBeUndefined();
  });

  it('should set mercadoPagoPaymentId', () => {
    payment.mercadoPagoPaymentId = 'mp-123';
    expect(payment.mercadoPagoPaymentId).toBe('mp-123');
  });

  it('should set qrCode', () => {
    payment.qrCode = 'qr-code';
    expect(payment.qrCode).toBe('qr-code');
  });

  it('should update orderId', () => {
    payment.orderId = 'order-456';
    expect(payment.orderId).toBe('order-456');
  });

  it('should update payment type', () => {
    payment.type = PaymentTypeEnum.PIX;
    expect(payment.type).toBe(PaymentTypeEnum.PIX);
  });

  it('should update createdAt', () => {
    const date = new Date('2024-01-01');
    payment.createdAt = date;
    expect(payment.createdAt).toBe(date);
  });

  it('should update updatedAt', () => {
    const date = new Date('2024-02-01');
    payment.updatedAt = date;
    expect(payment.updatedAt).toBe(date);
  });

  it('should update id', () => {
    payment.id = 'custom-id';
    expect(payment.id).toBe('custom-id');
  });

  it('should update status and refresh updatedAt', async () => {
    const oldUpdatedAt = payment.updatedAt;

    await new Promise((r) => setTimeout(r, 1));
    payment.status = PaymentStatusEnum.APPROVED;

    expect(payment.status).toBe(PaymentStatusEnum.APPROVED);
    expect(payment.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
  });
});
