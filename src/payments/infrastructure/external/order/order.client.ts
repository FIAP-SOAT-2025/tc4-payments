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
      await firstValueFrom(this.httpService.patch(`http://api-service-internal.tc4-order.svc.cluster.local/order/${orderId}/status`, { status }));
      return;
    } catch (error) {
      return `Error updating order payment status: ${error}`;
    }
  }
}