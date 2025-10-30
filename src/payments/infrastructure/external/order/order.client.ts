import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';
import { OrderGatewayInterface } from "src/payments/interfaces/order-gateway.interface";

@Injectable()
export class OrderClient implements OrderGatewayInterface {
  constructor(
    private httpService: HttpService
  ) {}

  async callUpdateOrderPaymentStatusApi(
    orderId: string,
    status: string
  ): Promise<void> {
    try {
      const response = await firstValueFrom(this.httpService.patch(`https://localhost:3000/order/payment-status/${orderId}`, { status }));
      return response.data;
    } catch (error) {
      console.error('Error updating order payment status:', error);
      throw error; 
    }
  }
}