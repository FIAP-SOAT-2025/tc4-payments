import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { ApiTags } from '@nestjs/swagger';
import { PaymentController } from 'src/payments/controllers/payment.controller';
import { PrismaPaymentRepository } from 'src/payments/infrastructure/persistence/prismaPayment.repository';
import { CreateCheckoutDto } from '../dto/create_checkout.dto';

@ApiTags('Payment')
@Controller('/payment')
export class PaymentApi {
  constructor(
    private readonly prismaPaymentRepository: PrismaPaymentRepository,
  ) {}
  @Patch('webhook/status/:id')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return await PaymentController.updatePaymentStatus(
      this.prismaPaymentRepository,
      id,
      updateStatusDto.status
    );
  }

  @Post('/checkout')
  async createCheckout(
    @Body() createCheckoutDto: CreateCheckoutDto,
  ) {
    return await PaymentController.createCheckout(
      this.prismaPaymentRepository,
      createCheckoutDto.orderId,
      createCheckoutDto.customer_email,
      createCheckoutDto.amount,
    );
  }
  /*@Get('/status/:id')
  async getStatus(@Param('id') id: string) {
    console.log('----------------------------API Get payment status:', id);
    return await PaymentController.getPaymentStatus(
      this.prismaPaymentRepository,
      id
    );
  }*/
}
