import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common"
import { firstValueFrom } from 'rxjs';
import { OrderStatusEnum } from "src/payments/domain/enums/order-status.enum";
import { OrderGatewayInterface } from "src/payments/interfaces/order-gateway.interface";

@Injectable()
export class OrderClient implements OrderGatewayInterface {
  constructor(
    private httpService: HttpService
  ) {}

  async callUpdateOrderPaymentStatusApi(
    orderId: string,
    status: OrderStatusEnum
  ): Promise<void | string> {
    try {
      await firstValueFrom(this.httpService.patch(`${process.env.API_BASE_URL}/order/payment-status/${orderId}`, { status }));
      return;
    } catch (error) {
      return `Error updating order payment status: ${error}`;
    }
  }
}