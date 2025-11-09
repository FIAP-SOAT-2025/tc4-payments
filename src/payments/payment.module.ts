import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/shared/infra/prisma.service';
import { PrismaPaymentRepository } from './infrastructure/persistence/prismaPayment.repository';
import { PaymentApi } from './infrastructure/api/controllers/payment.api';
import { OrderClient } from './infrastructure/external/order/order.client';
import { MercadoPagoClient } from './infrastructure/external/mercado-pago/mercado-pago.client';
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
  ],
  controllers: [PaymentApi],
  providers: [
    PrismaService,
    PrismaPaymentRepository,
    OrderClient,
    MercadoPagoClient,
    {
      provide: 'CallPaymentProviderGatewayInterface',
      useClass: MercadoPagoClient,
    },
    {
      provide: 'OrderGatewayInterface',
      useClass: OrderClient,
    },
  ],
  exports: [],
})
export class PaymentModule {}