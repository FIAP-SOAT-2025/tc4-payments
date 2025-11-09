import { PaymentStatusEnum } from "src/payments/domain/enums/payment-status.enum";
import { PaymentTypeEnum } from "src/payments/domain/enums/payment-type.enum";
import { CreatePaymentUseCase } from "src/payments/usecases/createPayment.usecase";
import { Payment } from "src/payments/domain/entities/payment.entity";

describe("CreatePaymentUseCase", () => {
  const mockPaymentGateway = {
    create: jest.fn(),
    updatePaymentStatus: jest.fn(),
    find: jest.fn()
  };

  const mockPaymentProvider = {
    callPaymentApi: jest.fn()
  };

  const email = "test@example.com";
  const orderId = "order123";
  const totalAmount = 100.5;

  const providerResponse = {
    id: "provider-payment-id",
    status: "approved",
    point_of_interaction: {
      transaction_data: {
        qr_code: "mock-qr-code"
      }
    }
  };

  const paymentResult = new Payment(orderId, PaymentTypeEnum.PIX);
  paymentResult.id = "payment-id";
  paymentResult.status = PaymentStatusEnum.APPROVED;
  paymentResult.mercadoPagoPaymentId = "provider-payment-id";
  paymentResult.qrCode = "mock-qr-code";

  beforeEach(() => {
    jest.clearAllMocks();
    mockPaymentProvider.callPaymentApi.mockResolvedValue(providerResponse);
    mockPaymentGateway.create.mockResolvedValue(paymentResult);
  });

  it("should call payment provider and gateway with correct params and return Payment", async () => {
    const result = await CreatePaymentUseCase.createPayment(
      mockPaymentGateway,
      mockPaymentProvider,
      email,
      orderId,
      totalAmount
    );

    expect(mockPaymentProvider.callPaymentApi).toHaveBeenCalledWith(totalAmount, email);
    expect(mockPaymentGateway.create).toHaveBeenCalledWith(
      orderId,
      PaymentTypeEnum.PIX,
      PaymentStatusEnum.APPROVED,
      "provider-payment-id",
      "mock-qr-code"
    );
    expect(result).toEqual(paymentResult);
  });

  it("should handle missing qr_code gracefully", async () => {
    const providerResponseNoQr = {
      ...providerResponse,
      point_of_interaction: { transaction_data: {} }
    };
    mockPaymentProvider.callPaymentApi.mockResolvedValueOnce(providerResponseNoQr);

    await CreatePaymentUseCase.createPayment(
      mockPaymentGateway,
      mockPaymentProvider,
      email,
      orderId,
      totalAmount
    );

    expect(mockPaymentGateway.create).toHaveBeenCalledWith(
      orderId,
      PaymentTypeEnum.PIX,
      PaymentStatusEnum.APPROVED,
      "provider-payment-id",
      undefined
    );
  });

  it("should convert status to uppercase and cast to PaymentStatusEnum", async () => {
    const providerResponseLower = {
      ...providerResponse,
      status: "pending"
    };
    mockPaymentProvider.callPaymentApi.mockResolvedValueOnce(providerResponseLower);

    await CreatePaymentUseCase.createPayment(
      mockPaymentGateway,
      mockPaymentProvider,
      email,
      orderId,
      totalAmount
    );

    expect(mockPaymentGateway.create).toHaveBeenCalledWith(
      orderId,
      PaymentTypeEnum.PIX,
      PaymentStatusEnum.PENDING,
      "provider-payment-id",
      "mock-qr-code"
    );
  });
});