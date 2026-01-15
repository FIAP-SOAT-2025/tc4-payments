import { FindPaymentUseCase } from '../../usecases/findPayment.usecase';
import { Payment, PaymentStatusEnum } from '../../domain/entities/payment.entity';
import { PaymentTypeEnum } from '../../domain/enums/payment-type.enum';
import { BaseException } from '../../../shared/exceptions/exceptions.base';
import { PaymentGatewayInterface } from '../../interfaces/payment-gateway.interface';

describe('FindPaymentUseCase', () => {
  let mockPaymentGateway: jest.Mocked<PaymentGatewayInterface>;
  let mockPayment: Payment;

  beforeEach(() => {
    mockPayment = new Payment('order-123', PaymentTypeEnum.CREDIT_CARD);
    mockPayment.status = PaymentStatusEnum.APPROVED;
    mockPayment.mercadoPagoPaymentId = 'mp-123';
    mockPayment.qrCode = 'qr-code-123';

    mockPaymentGateway = {
      create: jest.fn(),
      updatePaymentStatus: jest.fn(),
      find: jest.fn(),
    } as jest.Mocked<PaymentGatewayInterface>;
  });

  it('should return payment when found', async () => {
    mockPaymentGateway.find.mockResolvedValue(mockPayment);

    const result = await FindPaymentUseCase.getPaymentStatus('payment-id', mockPaymentGateway);

    expect(result).toBe(mockPayment);
    expect(mockPaymentGateway.find).toHaveBeenCalledWith('payment-id');
  });

  it('should throw BaseException when payment is not found', async () => {
    mockPaymentGateway.find.mockResolvedValue(null as any);

    await expect(
      FindPaymentUseCase.getPaymentStatus('non-existent-id', mockPaymentGateway)
    ).rejects.toThrow(BaseException);

    await expect(
      FindPaymentUseCase.getPaymentStatus('non-existent-id', mockPaymentGateway)
    ).rejects.toThrow('Payment with ID non-existent-id not found');
  });

  it('should throw BaseException with correct status code and error code', async () => {
    mockPaymentGateway.find.mockResolvedValue(null as any);

    try {
      await FindPaymentUseCase.getPaymentStatus('non-existent-id', mockPaymentGateway);
      fail('Should have thrown an exception');
    } catch (error) {
      expect(error).toBeInstanceOf(BaseException);
      if (error instanceof BaseException) {
        expect(error.statusCode).toBe(404);
        expect(error.errorCode).toBe('PAYMENT_NOT_FOUND');
      }
    }
  });
});
