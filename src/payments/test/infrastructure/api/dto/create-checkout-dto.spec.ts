import { validate } from 'class-validator';
import { CreateCheckoutDto } from 'src/payments/infrastructure/api/dto/create-checkout.dto';

describe('CreateCheckoutDto', () => {
	it('should instantiate with correct values', () => {
		const dto = new CreateCheckoutDto('order123', 'test@email.com', 100);
		expect(dto.orderId).toBe('order123');
		expect(dto.customer_email).toBe('test@email.com');
		expect(dto.amount).toBe(100);
	});

	it('should validate required fields', async () => {
		const dto = new CreateCheckoutDto('', '', null as any);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		const fields = errors.map(e => e.property);
		expect(fields).toContain('orderId');
		expect(fields).toContain('customer_email');
		expect(fields).toContain('amount');
	});

	it('should validate email format', async () => {
		const dto = new CreateCheckoutDto('order123', 'invalid-email', 100);
		const errors = await validate(dto);
		expect(errors.some(e => e.property === 'customer_email')).toBe(true);
	});

	it('should validate amount is a number', async () => {
		const dto = new CreateCheckoutDto('order123', 'test@email.com', 'not-a-number' as any);
		const errors = await validate(dto);
		expect(errors.some(e => e.property === 'amount')).toBe(true);
	});
});
