import { CheckoutPresenter } from '../../presenter/checkout.presenter';
import { Payment, PaymentStatusEnum } from '../../domain/entities/payment.entity';
import { PaymentTypeEnum } from '../../domain/enums/payment-type.enum';

describe('CheckoutPresenter', () => {
  it('should transform payment to response with id and status', () => {
    const payment = new Payment('order-123', PaymentTypeEnum.PIX);
    payment.status = PaymentStatusEnum.PENDING;

    const response = CheckoutPresenter.toResponse(payment);

    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('status');
    expect(response.id).toBe(payment.id);
    expect(response.status).toBe(PaymentStatusEnum.PENDING);
  });

  it('should handle payment with undefined id', () => {
    const payment = {
      status: PaymentStatusEnum.APPROVED,
    };

    const response = CheckoutPresenter.toResponse(payment);

    expect(response.id).toBe('');
    expect(response.status).toBe(PaymentStatusEnum.APPROVED);
  });

  it('should handle payment with null id', () => {
    const payment = {
      id: null,
      status: PaymentStatusEnum.REFUSED,
    };

    const response = CheckoutPresenter.toResponse(payment);

    expect(response.id).toBe('');
    expect(response.status).toBe(PaymentStatusEnum.REFUSED);
  });

  it('should preserve all status values', () => {
    const statusValues = [
      PaymentStatusEnum.APPROVED,
      PaymentStatusEnum.PENDING,
      PaymentStatusEnum.REFUSED,
      PaymentStatusEnum.EXPIRED,
      PaymentStatusEnum.CANCELLED,
    ];

    statusValues.forEach((status) => {
      const payment = {
        id: 'test-id',
        status: status,
      };

      const response = CheckoutPresenter.toResponse(payment);

      expect(response.status).toBe(status);
    });
  });
});
