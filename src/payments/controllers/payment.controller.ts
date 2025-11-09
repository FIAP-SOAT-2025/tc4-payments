import { PaymentGatewayInterface } from "../interfaces/payment-gateway.interface";
import { OrderGatewayInterface } from "../interfaces/order-gateway.interface";
import WebhookUpdatePaymentStatusUseCase from "../usecases/webhookUpdatePaymentStatus.usecase";
import { PaymentGateway } from "../gateways/payment.gateway";
import { PaymentStatusEnum } from "../domain/enums/payment-status.enum";
import { PaymentPresenter } from "../presenter/payment.presenter";
import { CreatePaymentUseCase } from "../usecases/createPayment.usecase";
import { CallPaymentProviderGatewayInterface } from "../interfaces/call-payment-provider-gateway.interface";
import { PaymentProviderGateway } from "../gateways/payment-provider.gateway";
import { OrderProviderGateway } from "../gateways/order-provider.gateway";
import { Payment } from "../domain/entities/payment.entity";
import { CheckoutPresenter } from "../presenter/checkout.presenter";
import { OrderStatusEnum } from "../domain/enums/order-status.enum";

export class PaymentController {
  constructor() {}

  private static createPaymentGateway(paymentRepository: PaymentGatewayInterface) {
    return new PaymentGateway(paymentRepository);
  }

  static async updatePaymentStatus(
    paymentRepository: PaymentGatewayInterface,
    orderGatewayInterface: OrderGatewayInterface,
    id: string,
    newStatus: PaymentStatusEnum
  ): Promise<void | string> {
    const paymentGateway = this.createPaymentGateway(paymentRepository);
    const orderProviderGateway = new OrderProviderGateway(orderGatewayInterface);
    const useCase = new WebhookUpdatePaymentStatusUseCase();
    const updatedPayment = await useCase.updateStatus(
      paymentGateway,
      id,
      newStatus
    );

    await orderProviderGateway.callUpdateOrderPaymentStatusApi(
      updatedPayment.orderId,
      this.newOrderStatus(updatedPayment.status)
    );

    return  PaymentPresenter.toResponse(updatedPayment);
  }

  static async createPaymentCheckout(
    paymentRepository: PaymentGatewayInterface,
    paymentProvider: CallPaymentProviderGatewayInterface,
    orderId: string,
    customer_email: string,
    amount: number,
  ): Promise<Payment> {
    const paymentGateway = this.createPaymentGateway(paymentRepository);
    const paymentProviderGateway = new PaymentProviderGateway(paymentProvider);
    const paymentCheckout = await CreatePaymentUseCase.createPayment(
      paymentGateway,
      paymentProviderGateway,
      orderId,
      customer_email,
      amount
    );
    return  CheckoutPresenter.toResponse(paymentCheckout);
  }

  private static newOrderStatus(paymentStatus: PaymentStatusEnum): OrderStatusEnum {
    if (paymentStatus === PaymentStatusEnum.APPROVED) {
      return OrderStatusEnum.RECEIVED;
    } else if (paymentStatus !== PaymentStatusEnum.PENDING) {
      return OrderStatusEnum.CANCELLED;
    }
    return OrderStatusEnum.PENDING;
  }
}