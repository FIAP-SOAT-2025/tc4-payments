
import { PaymentGatewayInterface } from "../interfaces/payment-gateway.interface";
import { Payment, PaymentStatusEnum } from '../domain/entities/payment.entity';
import ValidateStatusUseCase from "./validateStatus.usecase";

export default class WebhookUpdatePaymentStatusUseCase {
  constructor() {}
  async updateStatus(
    paymentGatewayI: PaymentGatewayInterface,
    id: string,
    newStatus: PaymentStatusEnum
  ): Promise<Payment> {
    let updatedPayment: Payment;
    const payment = await paymentGatewayI.find(id);
    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    ValidateStatusUseCase.validate(payment, newStatus, id);

    if (newStatus === PaymentStatusEnum.APPROVED) {
      updatedPayment = await paymentGatewayI.updatePaymentStatus(payment.id, newStatus);
    } else if (newStatus !== PaymentStatusEnum.PENDING) {
      updatedPayment = await paymentGatewayI.updatePaymentStatus(payment.id, newStatus);
    }

    return updatedPayment!;
  }
}