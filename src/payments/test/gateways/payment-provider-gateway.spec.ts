import { PaymentProviderGateway } from "src/payments/gateways/payment-provider.gateway";
import { CallPaymentProviderGatewayInterface } from "src/payments/interfaces/call-payment-provider-gateway.interface";

describe('PaymentProviderGateway', () => {
  let mockPaymentProvider: jest.Mocked<CallPaymentProviderGatewayInterface>;
  let gateway: PaymentProviderGateway;

  beforeEach(() => {
    mockPaymentProvider = {
      callPaymentApi: jest.fn(),
    };
    gateway = new PaymentProviderGateway(mockPaymentProvider);
  });

  it('should call paymentProvider.callPaymentApi with correct arguments', async () => {
    const totalAmount = 100;
    const email = 'test@example.com';
    mockPaymentProvider.callPaymentApi.mockResolvedValue('success');

    const result = await gateway.callPaymentApi(totalAmount, email);

    expect(mockPaymentProvider.callPaymentApi).toHaveBeenCalledWith(totalAmount, email);
    expect(result).toBe('success');
  });

  it('should propagate errors from paymentProvider.callPaymentApi', async () => {
    const error = new Error('API error');
    mockPaymentProvider.callPaymentApi.mockRejectedValue(error);

    await expect(gateway.callPaymentApi(50, 'fail@example.com')).rejects.toThrow('API error');
  });
});