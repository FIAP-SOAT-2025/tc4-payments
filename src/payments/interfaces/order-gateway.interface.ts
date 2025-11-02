import { OrderStatusEnum } from "../domain/enums/order-status.enum";

export interface OrderGatewayInterface {
  callUpdateOrderPaymentStatusApi(orderId: string, status: OrderStatusEnum): Promise<void | string>;
}