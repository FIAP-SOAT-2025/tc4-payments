import { MercadoPagoClient } from 'src/payments/infrastructure/external/mercado-pago/mercado-pago.client';
import { PaymentTypeEnum } from 'src/payments/domain/enums/payment-type.enum';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

describe('MercadoPagoClient', () => {
	let httpService: jest.Mocked<HttpService>;
	let client: MercadoPagoClient;
	const totalAmount = 123.45;
	const email = 'test@email.com';
	const mockHeaders = {
		Authorization: 'Bearer mock-token',
		'Content-Type': 'application/json',
		'X-Idempotency-Key': 'mock-uuid',
	};

	beforeEach(() => {
		httpService = {
			post: jest.fn(),
		} as any;
		client = new MercadoPagoClient(httpService);
		process.env.API_BASE_URL = 'http://api';
		process.env.ACCESS_TOKEN = 'mock-token';
	});

	it('should call httpService.post with correct body and headers and return data', async () => {
		const mockResponse = { data: { payment: 'ok' }, status: 201, statusText: 'Created', headers: {}, config: {} } as AxiosResponse;
		httpService.post.mockReturnValueOnce(of(mockResponse));
		const result = await client.callPaymentApi(totalAmount, email);
		expect(httpService.post).toHaveBeenCalledWith(
			'http://api',
			{
				transaction_amount: totalAmount,
				description: 'FIAP Fast Food Payment',
				payment_method_id: PaymentTypeEnum.PIX.toLowerCase(),
				payer: { email },
			},
			{ headers: mockHeaders }
		);
		expect(result).toEqual({ payment: 'ok' });
	});

	it('should return error string if httpService.post throws', async () => {
		httpService.post.mockReturnValueOnce(throwError(() => new Error('fail')));
		const result = await client.callPaymentApi(totalAmount, email);
		expect(result).toContain('Error creating payment:');
	});

	it('should build correct headers', () => {
		const headers = (client as any).buildHeaders();
		expect(headers).toEqual(mockHeaders);
	});

	it('should build correct payment body', async () => {
		const body = await (client as any).buildPaymentBody(totalAmount, email);
		expect(body).toEqual({
			transaction_amount: totalAmount,
			description: 'FIAP Fast Food Payment',
			payment_method_id: PaymentTypeEnum.PIX.toLowerCase(),
			payer: { email },
		});
	});
});
