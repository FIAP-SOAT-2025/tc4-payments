import { Payment } from '../../../domain/entities/payment.entity';
import { PaymentTypeEnum } from '../../../domain/enums/payment-type.enum';

describe('Payment Entity - id property', () => {
  it('should generate a UUID for id on creation', () => {
    const payment = new Payment('order-123', PaymentTypeEnum.CREDIT_CARD);
    expect(typeof payment.id).toBe('string');
    expect(payment.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('should allow setting a new id', () => {
    const payment = new Payment('order-123', PaymentTypeEnum.CREDIT_CARD);
    const newId = 'test-id-456';
    payment.id = newId;
    expect(payment.id).toBe(newId);
  });
});