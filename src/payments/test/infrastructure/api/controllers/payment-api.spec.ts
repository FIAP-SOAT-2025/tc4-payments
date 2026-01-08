import { PaymentController } from "src/payments/controllers/payment.controller";
import { PaymentApi } from "src/payments/infrastructure/api/controllers/payment.api";
import { UpdateStatusDto } from "src/payments/infrastructure/api/dto/update-status.dto";
import { PaymentStatusEnum } from "src/payments/domain/enums/payment-status.enum";
import { PrismaPaymentRepository } from "src/payments/infrastructure/persistence/prismaPayment.repository";
import { OrderGatewayInterface } from "src/payments/interfaces/order-gateway.interface";
import { ExceptionMapper } from "src/shared/exceptions/exception.mapper";

jest.mock('src/payments/controllers/payment.controller');
jest.mock('src/shared/exceptions/exception.mapper');

describe('PaymentApi', () => {
  let paymentApi: PaymentApi;
  let prismaPaymentRepository: PrismaPaymentRepository;
  let orderGatewayInterface: OrderGatewayInterface;

  beforeEach(() => {
    prismaPaymentRepository = {} as PrismaPaymentRepository;
    orderGatewayInterface = {} as OrderGatewayInterface;
    paymentApi = new PaymentApi(
      prismaPaymentRepository,
      {} as any,
      orderGatewayInterface
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call PaymentController.updatePaymentStatus and return result', async () => {
    const id = 'payment-id';
    const updateStatusDto: UpdateStatusDto = { status: PaymentStatusEnum.APPROVED };
    const expectedResult = { success: true };

    (PaymentController.updatePaymentStatus as jest.Mock).mockResolvedValue(expectedResult);

    const result = await paymentApi.updateStatus(id, updateStatusDto);

    expect(PaymentController.updatePaymentStatus).toHaveBeenCalledWith(
      prismaPaymentRepository,
      orderGatewayInterface,
      id,
      updateStatusDto.status
    );
    expect(result).toBe(expectedResult);
  });

  it('should map exception and throw if PaymentController.updatePaymentStatus throws', async () => {
    const id = 'payment-id';
   const updateStatusDto: UpdateStatusDto = { status: PaymentStatusEnum.REFUSED };
    const error = new Error('Some error');
    const mappedException = new Error('Mapped Exception');

    (PaymentController.updatePaymentStatus as jest.Mock).mockRejectedValue(error);
    (ExceptionMapper.mapToHttpException as jest.Mock).mockReturnValue(mappedException);

    await expect(paymentApi.updateStatus(id, updateStatusDto)).rejects.toBe(mappedException);

    expect(ExceptionMapper.mapToHttpException).toHaveBeenCalledWith(error);
  });

  describe('getStatus', () => {
    it('should call PaymentController.getPaymentStatus and return result', async () => {
      const id = 'payment-id-123';
      const expectedResult = JSON.stringify({
        id: 'payment-id-123',
        orderId: 'order-123',
        status: PaymentStatusEnum.APPROVED,
      });

      (PaymentController.getPaymentStatus as jest.Mock).mockResolvedValue(expectedResult);

      const result = await paymentApi.getStatus(id);

      expect(PaymentController.getPaymentStatus).toHaveBeenCalledWith(
        prismaPaymentRepository,
        id
      );
      expect(result).toBe(expectedResult);
    });

    it('should call PaymentController.getPaymentStatus with correct parameters', async () => {
      const id = 'specific-payment-id';
      (PaymentController.getPaymentStatus as jest.Mock).mockResolvedValue('{}');

      await paymentApi.getStatus(id);

      expect(PaymentController.getPaymentStatus).toHaveBeenCalledTimes(1);
      expect(PaymentController.getPaymentStatus).toHaveBeenCalledWith(
        prismaPaymentRepository,
        id
      );
    });
  });
});