import { PaymentResponseAdapter } from '../../../infrastructure/adapters/payment-response.adapter';
import { Payment, PaymentStatusEnum } from '../../../domain/entities/payment.entity';
import { PaymentTypeEnum } from '../../../domain/enums/payment-type.enum';

describe('PaymentResponseAdapter', () => {
  describe('adaptJsonToPayment', () => {
    it('should convert payment to JSON string with all fields', () => {
      const payment = new Payment('order-123', PaymentTypeEnum.PIX);
      payment.status = PaymentStatusEnum.PENDING;
      payment.mercadoPagoPaymentId = 'mp-123';
      payment.qrCode = 'qr-code-test';

      const result = PaymentResponseAdapter.adaptJsonToPayment(payment);
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty('id', payment.id);
      expect(parsed).toHaveProperty('orderId', 'order-123');
      expect(parsed).toHaveProperty('status', PaymentStatusEnum.PENDING);
      expect(parsed).toHaveProperty('type', PaymentTypeEnum.PIX);
      expect(parsed).toHaveProperty('mercadoPagoPaymentId', 'mp-123');
      expect(parsed).toHaveProperty('qrCode', 'qr-code-test');
      expect(parsed).toHaveProperty('createdAt');
      expect(parsed).toHaveProperty('updatedAt');
    });

    it('should return empty JSON when payment is null', () => {
      const result = PaymentResponseAdapter.adaptJsonToPayment(null);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual({});
    });

    it('should handle payment with undefined optional fields', () => {
      const payment = new Payment('order-456', PaymentTypeEnum.CREDIT_CARD);

      const result = PaymentResponseAdapter.adaptJsonToPayment(payment);
      const parsed = JSON.parse(result);

      expect(parsed.mercadoPagoPaymentId).toBeUndefined();
      expect(parsed.qrCode).toBeUndefined();
      expect(parsed.status).toBeUndefined();
    });

    it('should preserve all payment types in JSON', () => {
      const types = [
        PaymentTypeEnum.PIX,
        PaymentTypeEnum.CREDIT_CARD,
        PaymentTypeEnum.DEBIT_CARD,
      ];

      types.forEach((type) => {
        const payment = new Payment('order-123', type);
        const result = PaymentResponseAdapter.adaptJsonToPayment(payment);
        const parsed = JSON.parse(result);

        expect(parsed.type).toBe(type);
      });
    });

    it('should preserve all payment statuses in JSON', () => {
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
        const result = PaymentResponseAdapter.adaptJsonToPayment(payment);
        const parsed = JSON.parse(result);

        expect(parsed.status).toBe(status);
      });
    });
  });

  describe('adaptJsonToMessage', () => {
    it('should convert payment to JSON string message', () => {
      const payment = new Payment('order-789', PaymentTypeEnum.DEBIT_CARD);
      payment.status = PaymentStatusEnum.APPROVED;
      payment.mercadoPagoPaymentId = 'mp-789';
      payment.qrCode = 'qr-code-789';

      const result = PaymentResponseAdapter.adaptJsonToMessage(payment);
      const parsed = JSON.parse(result);

      expect(parsed).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should stringify complete payment object', () => {
      const payment = new Payment('order-999', PaymentTypeEnum.PIX);
      payment.status = PaymentStatusEnum.PENDING;

      const result = PaymentResponseAdapter.adaptJsonToMessage(payment);

      expect(result).toContain(payment.id);
      expect(result).toContain('order-999');
      expect(typeof result).toBe('string');
    });
  });
});
