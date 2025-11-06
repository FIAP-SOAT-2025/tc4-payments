import { UpdateStatusDto } from 'src/payments/infrastructure/api/dto/update-status.dto';
import { PaymentStatusEnum } from 'src/payments/domain/enums/payment-status.enum';
import { validate } from 'class-validator';

describe('UpdateStatusDto', () => {
	it('should instantiate with correct value', () => {
		const dto = new UpdateStatusDto(PaymentStatusEnum.APPROVED);
		expect(dto.status).toBe(PaymentStatusEnum.APPROVED);
	});

	it('should validate required field', async () => {
		const dto = new UpdateStatusDto(undefined as any);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors.some(e => e.property === 'status')).toBe(true);
	});

	it('should validate status is enum', async () => {
		const dto = new UpdateStatusDto('INVALID_STATUS' as any);
		const errors = await validate(dto);
		expect(errors.some(e => e.property === 'status')).toBe(true);
	});
});
