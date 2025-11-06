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
});