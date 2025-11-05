import { OrderStatusEnum } from "src/payments/domain/enums/order-status.enum";
import { OrderProviderGateway } from "src/payments/gateways/order-provider.gateway";
import { OrderGatewayInterface } from "src/payments/interfaces/order-gateway.interface";

describe('OrderProviderGateway', () => {
  let mockOrderGateway: jest.Mocked<OrderGatewayInterface>;
  let gateway: OrderProviderGateway;

  beforeEach(() => {
    mockOrderGateway = {
      callUpdateOrderPaymentStatusApi: jest.fn(),
    };
    gateway = new OrderProviderGateway(mockOrderGateway);
  });

  it('should call orderGateway.callUpdateOrderPaymentStatusApi with correct arguments', async () => {
    const orderId = 'order123';
    const status = OrderStatusEnum.RECEIVED;
    mockOrderGateway.callUpdateOrderPaymentStatusApi.mockResolvedValue('success');

    const result = await gateway.callUpdateOrderPaymentStatusApi(orderId, status);

    expect(mockOrderGateway.callUpdateOrderPaymentStatusApi).toHaveBeenCalledWith(orderId, status);
    expect(result).toBe('success');
  });

  it('should return void if underlying gateway returns void', async () => {
    const orderId = 'order456';
    const status = OrderStatusEnum.CANCELLED;
    mockOrderGateway.callUpdateOrderPaymentStatusApi.mockResolvedValue(undefined);

    const result = await gateway.callUpdateOrderPaymentStatusApi(orderId, status);

    expect(result).toBeUndefined();
  });
});