import { PaymentStatusEnum } from "src/payments/domain/enums/payment-status.enum";
import { OrderStatusEnum } from "src/payments/domain/enums/order-status.enum";
import { PaymentPresenter } from "src/payments/presenter/payment.presenter";
import { OrderProviderGateway } from "src/payments/gateways/order-provider.gateway";
import { PaymentGateway } from "src/payments/gateways/payment.gateway";
import WebhookUpdatePaymentStatusUseCase from "src/payments/usecases/webhookUpdatePaymentStatus.usecase";
import { PaymentGatewayInterface } from "src/payments/interfaces/payment-gateway.interface";
import { OrderGatewayInterface } from "src/payments/interfaces/order-gateway.interface";
import { PaymentController } from "src/payments/controllers/payment.controller";

jest.mock("src/payments/gateways/payment.gateway");
jest.mock("src/payments/gateways/order-provider.gateway");
jest.mock("src/payments/usecases/webhookUpdatePaymentStatus.usecase");
jest.mock("src/payments/presenter/payment.presenter");

describe("PaymentController", () => {
  let paymentRepositoryMock: jest.Mocked<PaymentGatewayInterface>;
  let orderGatewayInterfaceMock: jest.Mocked<OrderGatewayInterface>;
  let useCaseInstance: any;
  let orderProviderInstance: any;

  const id = "payment-id";

  const makePayment = (overrides = {}) => ({
    orderId: "order-123",
    status: PaymentStatusEnum.APPROVED,
    ...overrides,
  });

  beforeEach(() => {
    paymentRepositoryMock = {} as any;
    orderGatewayInterfaceMock = {} as any;

    (PaymentGateway as jest.Mock).mockImplementation(() =>
      Object.create(PaymentGateway.prototype)
    );

    orderProviderInstance = {
      callUpdateOrderPaymentStatusApi: jest.fn().mockResolvedValue(undefined),
    };
    (OrderProviderGateway as jest.Mock).mockImplementation(
      () => orderProviderInstance
    );

    useCaseInstance = { updateStatus: jest.fn() };
    (WebhookUpdatePaymentStatusUseCase as jest.Mock).mockImplementation(
      () => useCaseInstance
    );

    (PaymentPresenter.toResponse as jest.Mock).mockReturnValue(
      "presented-response"
    );

    jest.clearAllMocks();
  });

  describe("updatePaymentStatus", () => {
    it("should update payment status and return presenter data", async () => {
      const payment = makePayment();
      useCaseInstance.updateStatus.mockResolvedValue(payment);

      const result = await PaymentController.updatePaymentStatus(
        paymentRepositoryMock,
        orderGatewayInterfaceMock,
        id,
        PaymentStatusEnum.APPROVED
      );

      expect(useCaseInstance.updateStatus).toHaveBeenCalledWith(
        expect.any(PaymentGateway),
        id,
        PaymentStatusEnum.APPROVED
      );

      expect(
        orderProviderInstance.callUpdateOrderPaymentStatusApi
      ).toHaveBeenCalledWith(payment.orderId, OrderStatusEnum.RECEIVED);

      expect(PaymentPresenter.toResponse).toHaveBeenCalledWith(payment);
      expect(result).toBe("presented-response");
    });

    it("should set order CANCELLED when payment refused", async () => {
      const payment = makePayment({ status: PaymentStatusEnum.REFUSED });
      useCaseInstance.updateStatus.mockResolvedValue(payment);

      await PaymentController.updatePaymentStatus(
        paymentRepositoryMock,
        orderGatewayInterfaceMock,
        id,
        PaymentStatusEnum.REFUSED
      );

      expect(
        orderProviderInstance.callUpdateOrderPaymentStatusApi
      ).toHaveBeenCalledWith(payment.orderId, OrderStatusEnum.CANCELLED);
    });

    it("should set order PENDING when payment pending", async () => {
      const payment = makePayment({ status: PaymentStatusEnum.PENDING });
      useCaseInstance.updateStatus.mockResolvedValue(payment);

      await PaymentController.updatePaymentStatus(
        paymentRepositoryMock,
        orderGatewayInterfaceMock,
        id,
        PaymentStatusEnum.PENDING
      );

      expect(
        orderProviderInstance.callUpdateOrderPaymentStatusApi
      ).toHaveBeenCalledWith(payment.orderId, OrderStatusEnum.PENDING);
    });
  });
});
