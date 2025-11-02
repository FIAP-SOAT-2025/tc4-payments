export interface OrderGatewayInterface {
  callUpdateOrderPaymentStatusApi(orderId: string, status: string): Promise<void>;
}