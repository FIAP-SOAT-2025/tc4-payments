import { OrderGatewayInterface } from "../interfaces/order-gateway.interface";

export class OrderProviderGateway implements OrderGatewayInterface {
  constructor(
    private readonly orderGateway: OrderGatewayInterface
  ){}

  async callUpdateOrderPaymentStatusApi(
    orderId: string,
    status: string
  ): Promise<void> {
    return await this.orderGateway.callUpdateOrderPaymentStatusApi(
      orderId,
      status
    );
  }
}