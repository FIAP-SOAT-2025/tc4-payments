import { OrderClient } from 'src/payments/infrastructure/external/order/order.client';
import { OrderStatusEnum } from 'src/payments/domain/enums/order-status.enum';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('OrderClient', () => {
	let httpService: jest.Mocked<HttpService>;
	let client: OrderClient;
	const orderId = 'order123';
	const status = OrderStatusEnum.RECEIVED;

	beforeEach(() => {
		httpService = {
			patch: jest.fn(),
		} as any;
		client = new OrderClient(httpService);
		process.env.API_BASE_URL = 'http://test-api';
	});

  it('should call httpService.patch with correct url and body and return void on success', async () => {
    const axiosResponse = { data: 'ok', status: 200, statusText: 'OK', headers: {}, config: {} } as AxiosResponse;
    httpService.patch.mockReturnValueOnce(of(axiosResponse));
    const result = await client.callUpdateOrderPaymentStatusApi(orderId, status);
    expect(httpService.patch).toHaveBeenCalledWith(
      `http://test-api/order/payment-status/${orderId}`,
      { status }
    );
    expect(result).toBeUndefined();
  });

  it('should call httpService.patch with different status', async () => {
    const axiosResponse = { data: 'ok', status: 200, statusText: 'OK', headers: {}, config: {} } as AxiosResponse;
    httpService.patch.mockReturnValueOnce(of(axiosResponse));
    const otherStatus = OrderStatusEnum.CANCELLED;
    const result = await client.callUpdateOrderPaymentStatusApi(orderId, otherStatus);
    expect(httpService.patch).toHaveBeenCalledWith(
      `http://test-api/order/payment-status/${orderId}`,
      { status: otherStatus }
    );
    expect(result).toBeUndefined();
  });

  it('should return error string if httpService.patch throws', async () => {
    const error = new Error('fail');
    httpService.patch.mockReturnValueOnce(throwError(() => error));
    const result = await client.callUpdateOrderPaymentStatusApi(orderId, status);
    expect(result).toBe(`Error updating order payment status: ${error}`);
  });

  it('should handle error object with message', async () => {
    const error = { message: 'custom error' };
    httpService.patch.mockReturnValueOnce(throwError(() => error));
    const result = await client.callUpdateOrderPaymentStatusApi(orderId, status);
    expect(result).toContain('Error updating order payment status:');
  });
});
