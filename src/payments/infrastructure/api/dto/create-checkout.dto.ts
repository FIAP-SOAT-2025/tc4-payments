import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber } from "class-validator";

export class CreateCheckoutDto {
  constructor(
    orderId: string,
    customer_email: string,
    amount: number,
  ) {
    this.orderId = orderId;
    this.customer_email = customer_email;
    this.amount = amount;
  }

  @ApiProperty()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  customer_email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}