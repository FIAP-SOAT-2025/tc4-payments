import { BaseException } from "src/shared/exceptions/exceptions.base";
import { FindPaymentUseCase } from "src/payments/usecases/findPayment.usecase";
import { Payment } from "src/payments/domain/entities/payment.entity";
import { PaymentStatusEnum } from "src/payments/domain/enums/payment-status.enum";
import { PaymentTypeEnum } from "src/payments/domain/enums/payment-type.enum";

describe("FindPaymentUseCase", () => {
  const mockPaymentGateway = {
    create: jest.fn(),
    updatePaymentStatus: jest.fn(),
    find: jest.fn()
  };

  const mockPayment = new Payment("order123", PaymentTypeEnum.PIX);
  mockPayment.id = "payment-id-123";
  mockPayment.status = PaymentStatusEnum.APPROVED;
  mockPayment.mercadoPagoPaymentId = "mp-payment-id";
  mockPayment.qrCode = "mock-qr-code";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPaymentStatus", () => {
    it("should return payment when found", async () => {
      mockPaymentGateway.find.mockResolvedValue(mockPayment);

      const result = await FindPaymentUseCase.getPaymentStatus(
        "payment-id-123",
        mockPaymentGateway
      );

      expect(mockPaymentGateway.find).toHaveBeenCalledWith("payment-id-123");
      expect(result).toEqual(mockPayment);
    });

    it("should throw BaseException when payment is not found", async () => {
      mockPaymentGateway.find.mockResolvedValue(null);

      await expect(
        FindPaymentUseCase.getPaymentStatus("non-existent-id", mockPaymentGateway)
      ).rejects.toThrow(BaseException);
    });

    it("should throw exception with correct message and status code", async () => {
      const paymentId = "non-existent-id";
      mockPaymentGateway.find.mockResolvedValue(null);

      try {
        await FindPaymentUseCase.getPaymentStatus(paymentId, mockPaymentGateway);
        fail("Should have thrown an exception");
      } catch (error) {
        expect(error).toBeInstanceOf(BaseException);
        expect(error.message).toBe(`Payment with ID ${paymentId} not found`);
        expect(error.statusCode).toBe(404);
        expect(error.errorCode).toBe("PAYMENT_NOT_FOUND");
      }
    });

    it("should throw exception with correct error code", async () => {
      mockPaymentGateway.find.mockResolvedValue(null);

      await expect(
        FindPaymentUseCase.getPaymentStatus("test-id", mockPaymentGateway)
      ).rejects.toMatchObject({
        errorCode: "PAYMENT_NOT_FOUND"
      });
    });

    it("should call gateway find method with correct id", async () => {
      const paymentId = "specific-payment-id";
      mockPaymentGateway.find.mockResolvedValue(mockPayment);

      await FindPaymentUseCase.getPaymentStatus(paymentId, mockPaymentGateway);

      expect(mockPaymentGateway.find).toHaveBeenCalledTimes(1);
      expect(mockPaymentGateway.find).toHaveBeenCalledWith(paymentId);
    });
  });
});
