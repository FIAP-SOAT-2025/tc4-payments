import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { ApiTags } from '@nestjs/swagger';
import { PaymentController } from 'src/payments/controllers/payment.controller';
import { PrismaPaymentRepository } from 'src/payments/infrastructure/persistence/prismaPayment.repository';
import { CreateCheckoutDto } from '../dto/create_checkout.dto';
import { CallPaymentProviderGatewayInterface } from '../../../../payments/interfaces/call-payment-provider-gateway.interface';
import { OrderGatewayInterface } from 'src/payments/interfaces/order-gateway.interface';
@ApiTags('Payment')
@Controller('/payment')
export class PaymentApi {
  constructor(
    private readonly prismaPaymentRepository: PrismaPaymentRepository,
    private readonly callPaymentProviderGateway: CallPaymentProviderGatewayInterface,
    private readonly orderGatewayInterface: OrderGatewayInterface,  
  ) {}
  @Patch('webhook/status/:id')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return await PaymentController.updatePaymentStatus(
      this.prismaPaymentRepository,
      this.orderGatewayInterface,
      id,
      updateStatusDto.status
    );
  }

  @Post('/checkout')
  async createCheckout(
    @Body() createCheckoutDto: CreateCheckoutDto,
  ) {
    return await PaymentController.createPaymentCheckout(
      this.prismaPaymentRepository,
      this.callPaymentProviderGateway,
      createCheckoutDto.orderId,
      createCheckoutDto.customer_email,
      createCheckoutDto.amount,
    );
  }
}
