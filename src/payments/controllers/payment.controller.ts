import { PaymentGatewayInterface } from "../interfaces/payment-gateway.interface";
import WebhookUpdatePaymentStatusUseCase from "../usecases/webhookUpdatePaymentStatus.usecase";
import { PaymentGateway } from "../gateways/payment.gateway";
import { PaymentStatusEnum } from "../domain/enums/payment-status.enum";
import { PaymentPresenter } from "../presenter/payment.presenter";
import { CreatePaymentUseCase } from "../usecases/createPayment.usecase";
import { CallPaymentProviderGatewayInterface } from "../interfaces/call-payment-provider-gateway.interface";
import { PaymentProviderGateway } from "../gateways/payment-provider.gateway";

export class PaymentController {
  constructor() { }

  private static createPaymentGateway(paymentRepository: PaymentGatewayInterface) {
    return new PaymentGateway(paymentRepository);
  }

  static async updatePaymentStatus(
    paymentRepository: PaymentGatewayInterface,
    id: string,
    newStatus: PaymentStatusEnum
  ) {
    const paymentGateway = this.createPaymentGateway(paymentRepository);
    const useCase = new WebhookUpdatePaymentStatusUseCase();
    const updatedPayment = await useCase.updateStatus(
      paymentGateway,
      id,
      newStatus
    );
    return  PaymentPresenter.toResponse(updatedPayment);
  }

  static async createPaymentCheckout(
    paymentRepository: PaymentGatewayInterface,
    paymentProvider: CallPaymentProviderGatewayInterface,
    orderId: string,
    customer_email: string,
    amount: number,
  ) {
    const paymentGateway = this.createPaymentGateway(paymentRepository);
    const paymentProviderGateway = new PaymentProviderGateway(paymentProvider);
    const paymentCheckout = await CreatePaymentUseCase.createPayment(
      paymentGateway,
      paymentProviderGateway,
      orderId,
      customer_email,
      amount
    );
    return  PaymentPresenter.toResponse(paymentCheckout);
  }
}