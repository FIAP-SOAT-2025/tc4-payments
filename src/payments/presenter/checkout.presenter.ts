export class CheckoutPresenter {
  static toResponse(payment: any): any {
    return {
      id: payment.id ?? "",
      status: payment.status,
    };
  }
}