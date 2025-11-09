import { Payment } from "src/payments/domain/entities/payment.entity";
import { PaymentStatusEnum } from "src/payments/domain/enums/payment-status.enum";
import { PaymentGatewayInterface } from "src/payments/interfaces/payment-gateway.interface";
import ValidateStatusUseCase from "src/payments/usecases/validateStatus.usecase";
import WebhookUpdatePaymentStatusUseCase from "src/payments/usecases/webhookUpdatePaymentStatus.usecase";
jest.mock('src/payments/usecases/validateStatus.usecase');

describe('WebhookUpdatePaymentStatusUseCase', () => {
  let paymentGatewayI: jest.Mocked<PaymentGatewayInterface> & { find: jest.Mock<Promise<Payment | undefined>, any> };
  let usecase: WebhookUpdatePaymentStatusUseCase;

  const basePayment = (status: PaymentStatusEnum): Payment => {
    const payment = new Payment('order-1', undefined as any);
    payment.id = '123';
    payment.status = status;
    return payment;
  };

  const payment = basePayment(PaymentStatusEnum.PENDING);

  beforeEach(() => {
    paymentGatewayI = {
      find: jest.fn(),
      updatePaymentStatus: jest.fn(),
    } as any;
    usecase = new WebhookUpdatePaymentStatusUseCase();
    (ValidateStatusUseCase.validate as jest.Mock).mockClear();
  });

  it('should throw error if payment not found', async () => {
    paymentGatewayI.find.mockResolvedValue(undefined);

    await expect(
      usecase.updateStatus(paymentGatewayI, 'notfound', PaymentStatusEnum.APPROVED)
    ).rejects.toThrow('Payment with ID notfound not found');
  });

  it('should call ValidateStatusUseCase.validate with correct params', async () => {
    paymentGatewayI.find.mockResolvedValue(payment);
    const approvedPayment = basePayment(PaymentStatusEnum.APPROVED);
    paymentGatewayI.updatePaymentStatus.mockResolvedValue(approvedPayment);

    await usecase.updateStatus(paymentGatewayI, payment.id, PaymentStatusEnum.APPROVED);

    expect(ValidateStatusUseCase.validate).toHaveBeenCalledWith(payment, PaymentStatusEnum.APPROVED, payment.id);
  });

  it('should update status to APPROVED', async () => {
    paymentGatewayI.find.mockResolvedValue(payment);
    const updatedPayment = basePayment(PaymentStatusEnum.APPROVED);
    paymentGatewayI.updatePaymentStatus.mockResolvedValue(updatedPayment);

    const result = await usecase.updateStatus(paymentGatewayI, payment.id, PaymentStatusEnum.APPROVED);

    expect(paymentGatewayI.updatePaymentStatus).toHaveBeenCalledWith(payment.id, PaymentStatusEnum.APPROVED);
    expect(result).toEqual(updatedPayment);
  });

  it('should update status to REFUSED (not PENDING)', async () => {
    paymentGatewayI.find.mockResolvedValue(payment);
    const updatedPayment = basePayment(PaymentStatusEnum.REFUSED);
    paymentGatewayI.updatePaymentStatus.mockResolvedValue(updatedPayment);

    const result = await usecase.updateStatus(paymentGatewayI, payment.id, PaymentStatusEnum.REFUSED);

    expect(paymentGatewayI.updatePaymentStatus).toHaveBeenCalledWith(payment.id, PaymentStatusEnum.REFUSED);
    expect(result).toEqual(updatedPayment);
  });

  it('should not update status if newStatus is PENDING', async () => {
    paymentGatewayI.find.mockResolvedValue(payment);

    await expect(
      usecase.updateStatus(paymentGatewayI, payment.id, PaymentStatusEnum.PENDING)
    ).resolves.toBeUndefined();
  });
});