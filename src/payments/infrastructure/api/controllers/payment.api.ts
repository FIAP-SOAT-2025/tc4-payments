import { Body, Controller, Param, Patch, Post, Get} from '@nestjs/common';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { ApiTags } from '@nestjs/swagger';
import { PaymentController } from 'src/payments/controllers/payment.controller';
import { PrismaPaymentRepository } from 'src/payments/infrastructure/persistence/prismaPayment.repository';
import { CreateCheckoutDto } from '../dto/create-checkout.dto';
import { CallPaymentProviderGatewayInterface } from '../../../../payments/interfaces/call-payment-provider-gateway.interface';
import { OrderGatewayInterface } from 'src/payments/interfaces/order-gateway.interface';
import { Inject } from '@nestjs/common';
import { ExceptionMapper } from 'src/shared/exceptions/exception.mapper';
import { BaseException } from 'src/shared/exceptions/exceptions.base';

@ApiTags('Payment')
@Controller('/payment')
export class PaymentApi {
  constructor(
    private readonly prismaPaymentRepository: PrismaPaymentRepository,
    @Inject('CallPaymentProviderGatewayInterface')
    private readonly callPaymentProviderGateway: CallPaymentProviderGatewayInterface,
    @Inject('OrderGatewayInterface')
    private readonly orderGatewayInterface: OrderGatewayInterface,
  ) {}

  @Patch('webhook/status/:id')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    try {
      console.log(`PAYMENT API | WEBHOOK | DATA : ${JSON.stringify(updateStatusDto)}`);
      return await PaymentController.updatePaymentStatus(
        this.prismaPaymentRepository,
        this.orderGatewayInterface,
        id,
        updateStatusDto.status
      );
    } catch (error) {
      throw ExceptionMapper.mapToHttpException(error as BaseException);
    }
  }

  @Post('/checkout')
  async createCheckout(
    @Body() createCheckoutDto: CreateCheckoutDto,
  ) {
    try {
      console.log(`PAYMENT API | CHECKOUT | DATA : ${JSON.stringify(createCheckoutDto)}`);
      return await PaymentController.createPaymentCheckout(
        this.prismaPaymentRepository,
        this.callPaymentProviderGateway,
        createCheckoutDto.orderId,
        createCheckoutDto.customer_email,
        createCheckoutDto.amount,
      );
    } catch (error) {
      throw ExceptionMapper.mapToHttpException(error as BaseException);
    }
  }

  @Get('/status/:id')
  async getStatus(@Param('id') id: string) {
    return await PaymentController.getPaymentStatus(
      this.prismaPaymentRepository,
      id
    );
  }
}
