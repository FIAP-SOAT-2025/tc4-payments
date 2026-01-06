import { PrismaPaymentRepository } from 'src/payments/infrastructure/persistence/prismaPayment.repository';
import { PaymentTypeEnum } from 'src/payments/domain/enums/payment-type.enum';
import { PaymentStatusEnum } from 'src/payments/domain/enums/payment-status.enum';
import { NotFoundException } from '@nestjs/common';

describe('PrismaPaymentRepository', () => {
	let prisma: any;
	let repository: PrismaPaymentRepository;
	const mockPayment = {
		id: 'payment1',
		orderId: 'order1',
		type: PaymentTypeEnum.PIX,
		status: PaymentStatusEnum.PENDING,
		mercadoPagoPaymentId: 'mp-123',
		qrCode: 'qr-abc',
	};

	beforeEach(() => {
		prisma = {
			payment: {
				create: jest.fn(),
				update: jest.fn(),
				findUnique: jest.fn(),
			},
		};
		repository = new PrismaPaymentRepository(prisma);
		jest.clearAllMocks();
	});

	//describe('create', () => {
		//it('should create a payment and return it', async () => {
		//	prisma.payment.create.mockResolvedValueOnce(mockPayment);
		//	const result = await repository.create(
		//		mockPayment.orderId,
		//		mockPayment.type,
		//		mockPayment.status,
		//		mockPayment.mercadoPagoPaymentId,
		//		mockPayment.qrCode
		//	);
		//	expect(prisma.payment.create).toHaveBeenCalledWith({
		//		data: {
		//			orderId: mockPayment.orderId,
		//			type: mockPayment.type,
		//			status: mockPayment.status,
		//			mercadoPagoPaymentId: mockPayment.mercadoPagoPaymentId,
		//			qrCode: mockPayment.qrCode,
		//		},
		//	});
		//	expect(result).toBe(mockPayment);
		//});

		/*it('should throw error and log if prisma.payment.create fails', async () => {
			const error = new Error('fail');
			prisma.payment.create.mockRejectedValueOnce(error);
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
			await expect(
				repository.create(
					mockPayment.orderId,
					mockPayment.type,
					mockPayment.status,
					mockPayment.mercadoPagoPaymentId,
					mockPayment.qrCode
				)
			).rejects.toThrow('Failed to create payment');
			expect(consoleSpy).toHaveBeenCalledWith('Error creating payment, payment repository:', error);
			consoleSpy.mockRestore();
		});
	});*/

	describe('updatePaymentStatus', () => {
		it('should update payment status and return updated payment', async () => {
			const updated = { ...mockPayment, status: PaymentStatusEnum.APPROVED };
			prisma.payment.update.mockResolvedValueOnce(updated);
			const result = await repository.updatePaymentStatus(mockPayment.id, PaymentStatusEnum.APPROVED);
			expect(prisma.payment.update).toHaveBeenCalledWith({
				where: { id: mockPayment.id },
				data: { status: PaymentStatusEnum.APPROVED },
			});
			expect(result).toBe(updated);
		});

		it('should throw error and log if prisma.payment.update fails', async () => {
			const error = new Error('fail');
			prisma.payment.update.mockRejectedValueOnce(error);
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
			await expect(
				repository.updatePaymentStatus(mockPayment.id, PaymentStatusEnum.APPROVED)
			).rejects.toThrow('Failed to update payment status');
			expect(consoleSpy).toHaveBeenCalledWith('Error updating payment status:', error);
			consoleSpy.mockRestore();
		});
	});

	describe('find', () => {
		it('should return payment if found', async () => {
			prisma.payment.findUnique.mockResolvedValueOnce(mockPayment);
			const result = await repository.find(mockPayment.id);
			expect(prisma.payment.findUnique).toHaveBeenCalledWith({ where: { id: mockPayment.id } });
			expect(result).toBe(mockPayment);
		});

		it('should throw NotFoundException if payment not found', async () => {
			prisma.payment.findUnique.mockResolvedValueOnce(null);
			await expect(repository.find(mockPayment.id)).rejects.toThrow(NotFoundException);
		});
	});
});
