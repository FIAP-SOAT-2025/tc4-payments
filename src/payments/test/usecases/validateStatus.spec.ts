import { Payment } from 'src/payments/domain/entities/payment.entity';
import { PaymentStatusEnum } from 'src/payments/domain/enums/payment-status.enum';
import ValidateStatusUseCase from 'src/payments/usecases/validateStatus.usecase';
import { BaseException } from 'src/shared/exceptions/exceptions.base';

describe('ValidateStatusUseCase', () => {

  const basePayment = (status: PaymentStatusEnum): Payment => {
    const payment = new Payment('order-1', undefined as any);
    payment.id = '123';
    payment.status = status;
    return payment;
  };


  it('should throw if payment is already in the new status', () => {
    const payment = basePayment(PaymentStatusEnum.PENDING);
    expect(() =>
      ValidateStatusUseCase.validate(payment, PaymentStatusEnum.PENDING, payment.id)
    ).toThrow(BaseException);

    try {
      ValidateStatusUseCase.validate(payment, PaymentStatusEnum.PENDING, payment.id);
    } catch (e: any) {
      expect(e.message).toContain('already in PENDING status');
      expect(e.statusCode).toBe(409);
      expect(e.errorCode).toBe('PAYMENT_ALREADY_IN_STATUS');
    }
  });

  it('should throw if payment is already approved', () => {
    const payment = basePayment(PaymentStatusEnum.APPROVED);
    expect(() =>
      ValidateStatusUseCase.validate(payment, PaymentStatusEnum.PENDING, payment.id)
    ).toThrow(BaseException);

    try {
      ValidateStatusUseCase.validate(payment, PaymentStatusEnum.PENDING, payment.id);
    } catch (e: any) {
      expect(e.message).toContain('is approved and cannot be updated');
      expect(e.statusCode).toBe(409);
      expect(e.errorCode).toBe('PAYMENT_ALREADY_APPROVED');
    }
  });

  it('should not throw if payment status is different and not approved', () => {
    const payment = basePayment(PaymentStatusEnum.PENDING);
    expect(() =>
      ValidateStatusUseCase.validate(payment, PaymentStatusEnum.APPROVED, payment.id)
    ).not.toThrow();
  });
});