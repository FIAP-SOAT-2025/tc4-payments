import { OrderStatusEnum } from "../domain/enums/order-status.enum";
import { OrderGatewayInterface } from "../interfaces/order-gateway.interface";

export class OrderProviderGateway implements OrderGatewayInterface {
  constructor(
    private readonly orderGateway: OrderGatewayInterface
  ){}

  async callUpdateOrderPaymentStatusApi(
    orderId: string,
    status: OrderStatusEnum
  ): Promise<void | string> {
    return await this.orderGateway.callUpdateOrderPaymentStatusApi(
      orderId,
      status
    );
  }
}