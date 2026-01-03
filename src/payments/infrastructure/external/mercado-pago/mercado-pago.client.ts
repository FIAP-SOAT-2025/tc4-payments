import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';
import { PaymentTypeEnum } from "src/payments/domain/enums/payment-type.enum";
import { CallPaymentProviderGatewayInterface } from "src/payments/interfaces/call-payment-provider-gateway.interface";

@Injectable()
export class MercadoPagoClient implements CallPaymentProviderGatewayInterface{
  constructor(
    private readonly httpService: HttpService,
  ){}

  async callPaymentApi(totalAmount: number, email: string): Promise<any> {
    const body = await this.buildPaymentBody(totalAmount, email);
    const headers = this.buildHeaders();
    console.log("Entrei no call payment api");
    try {
      const response = await firstValueFrom(this.httpService.post(process.env.API_BASE_URL!, body, { headers }));
      console.log("response do mercado pago", response);
      return response.data;
    } catch (error) {
      return `Error creating payment: ${error}`;
    }
  }

  private async buildPaymentBody(totalAmount: number, email: string): Promise<object> {
    const payer_email = email;
    return {
      transaction_amount: totalAmount,
      description: 'FIAP Fast Food Payment',
      payment_method_id: PaymentTypeEnum.PIX.toLowerCase(),
      payer: {
        email: payer_email,
      },
    };
  }

  private buildHeaders(): object {
    return {
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': uuidv4(),
    };
  }
}