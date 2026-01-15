import { PaymentGateway } from '../../gateways/payment.gateway';
import { PaymentStatusEnum } from '../../domain/enums/payment-status.enum';
import { PaymentTypeEnum } from '../../domain/enums/payment-type.enum';
import { Payment } from '../../domain/entities/payment.entity';

describe('PaymentGateway', () => {
  let paymentGateway: PaymentGateway;
  let mockRepository: any;
  let mockPayment: Payment;

  beforeEach(() => {
    mockPayment = new Payment('order-456', PaymentTypeEnum.CREDIT_CARD);
    mockPayment.id = 'payment123';
    mockPayment.status = PaymentStatusEnum.PENDING;
    mockPayment.mercadoPagoPaymentId = 'mp-789';
    mockPayment.qrCode = 'some-qr-code';

    mockRepository = {
      create: jest.fn(),
      updatePaymentStatus: jest.fn(),
      find: jest.fn(),
    };

    paymentGateway = new PaymentGateway(mockRepository);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a payment successfully', async () => {
      mockRepository.create.mockResolvedValue(mockPayment);

      const result = await paymentGateway.create(
        'order-456',
        PaymentTypeEnum.CREDIT_CARD,
        PaymentStatusEnum.PENDING,
        'mp-789',
        'some-qr-code'
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        'order-456',
        PaymentTypeEnum.CREDIT_CARD,
        PaymentStatusEnum.PENDING,
        'mp-789',
        'some-qr-code'
      );
      expect(result).toBe(mockPayment);
    });

    it('should log error and rethrow when repository.create fails', async () => {
      const error = new Error('Repository error');
      mockRepository.create.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(
        paymentGateway.create(
          'order-456',
          PaymentTypeEnum.CREDIT_CARD,
          PaymentStatusEnum.PENDING,
          'mp-789',
          'some-qr-code'
        )
      ).rejects.toThrow('Repository error');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error creating payment payment gateway:',
        error
      );

      consoleSpy.mockRestore();
    });

    it('should create payment with different types', async () => {
      const types = [PaymentTypeEnum.PIX, PaymentTypeEnum.DEBIT_CARD];

      for (const type of types) {
        mockRepository.create.mockResolvedValue(mockPayment);

        await paymentGateway.create(
          'order-123',
          type,
          PaymentStatusEnum.PENDING,
          'mp-123',
          'qr-123'
        );

        expect(mockRepository.create).toHaveBeenCalledWith(
          'order-123',
          type,
          PaymentStatusEnum.PENDING,
          'mp-123',
          'qr-123'
        );
      }
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status successfully', async () => {
      mockPayment.status = PaymentStatusEnum.APPROVED;
      mockRepository.updatePaymentStatus.mockResolvedValue(mockPayment);

      const result = await paymentGateway.updatePaymentStatus(
        'payment123',
        PaymentStatusEnum.APPROVED
      );

      expect(mockRepository.updatePaymentStatus).toHaveBeenCalledWith(
        'payment123',
        PaymentStatusEnum.APPROVED
      );
      expect(result).toBe(mockPayment);
      expect(result.status).toBe(PaymentStatusEnum.APPROVED);
    });

    it('should update to different statuses', async () => {
      const statuses = [
        PaymentStatusEnum.PENDING,
        PaymentStatusEnum.REFUSED,
        PaymentStatusEnum.EXPIRED,
        PaymentStatusEnum.CANCELLED,
      ];

      for (const status of statuses) {
        mockPayment.status = status;
        mockRepository.updatePaymentStatus.mockResolvedValue(mockPayment);

        const result = await paymentGateway.updatePaymentStatus('payment123', status);

        expect(result.status).toBe(status);
      }
    });
  });

  describe('find', () => {
    it('should find and return a payment', async () => {
      mockRepository.find.mockResolvedValue(mockPayment);

      const result = await paymentGateway.find('payment123');

      expect(mockRepository.find).toHaveBeenCalledWith('payment123');
      expect(result).toBe(mockPayment);
    });

    it('should throw error when payment is not found', async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(paymentGateway.find('non-existent-id')).rejects.toThrow(
        'Payment with ID non-existent-id not found'
      );

      expect(mockRepository.find).toHaveBeenCalledWith('non-existent-id');
    });

    it('should throw error when payment is undefined', async () => {
      mockRepository.find.mockResolvedValue(undefined);

      await expect(paymentGateway.find('undefined-id')).rejects.toThrow(
        'Payment with ID undefined-id not found'
      );
    });
  });
});
