import { PaymentGatewayInterface } from "../interfaces/payment-gateway.interface";
import WebhookUpdatePaymentStatusUseCase from "../usecases/webhookUpdatePaymentStatus.usecase";
import { PaymentGateway } from "../gateways/payment.gateway";
import { PaymentStatusEnum } from "../domain/enums/payment-status.enum";
import { PaymentPresenter } from "../presenter/payment.presenter";
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

  /*static async getPaymentStatus(
    paymentRepository: PaymentGatewayInterface,
    id: string
  ) {
    const paymentGateway = this.createPaymentGateway(paymentRepository);
    //const payment = await FindPaymentUseCase.getPaymentStatus(id, paymentGateway);
    return PaymentResponseAdapter.adaptJsonToMessage(payment);
  }*/
}