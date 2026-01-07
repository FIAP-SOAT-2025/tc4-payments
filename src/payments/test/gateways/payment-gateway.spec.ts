import { PrismaPaymentRepository } from '../../infrastructure/persistence/prismaPayment.repository';
import { PaymentStatusEnum } from '../../domain/enums/payment-status.enum';
import { PaymentTypeEnum } from '../../domain/enums/payment-type.enum';

describe('PaymentGateway - create', () => {
  const mockPayment = {
    id: 'payment123',
    orderId: 'order456',
    type: PaymentTypeEnum.CREDIT_CARD,
    status: PaymentStatusEnum.PENDING,
    mercadoPagoPaymentId: 'mp-789',
    qrCode: 'some-qr-code',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let prismaService: any;
  let repository: PrismaPaymentRepository;

  beforeEach(() => {
    prismaService = {
      payment: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    repository = new PrismaPaymentRepository(prismaService);
    jest.clearAllMocks();
  });

  //it('should create a payment and return it', async () => {
  ///  prismaService.payment.create.mockResolvedValueOnce(mockPayment);
//
  //  const result = await repository.create(
  //    mockPayment.orderId,
  //    mockPayment.type,
  //    mockPayment.status,
  //    mockPayment.mercadoPagoPaymentId,
  //    mockPayment.qrCode
  //  );

   // expect(prismaService.payment.create).toHaveBeenCalledWith({
    //  data: {
    //    orderId: mockPayment.orderId,
    //    type: mockPayment.type,
    //    status: mockPayment.status,
    //    mercadoPagoPaymentId: mockPayment.mercadoPagoPaymentId,
    //    qrCode: mockPayment.qrCode,
    //  },
    //});
    //expect(result).toBe(mockPayment);
  //});

  it('should throw and log error if prismaService.payment.create throws', async () => {
    const error = new Error('Repository error');
    prismaService.payment.create.mockRejectedValueOnce(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(
      repository.create(
        mockPayment.orderId,
        mockPayment.type,
        mockPayment.status,
        mockPayment.mercadoPagoPaymentId,
        mockPayment.qrCode
      )
    ).rejects.toThrow('Failed to create payment');

    //expect(consoleSpy).toHaveBeenCalledWith(
    //  'Error creating payment, payment repository:',
    //  error
    //);

    consoleSpy.mockRestore();
  });
});