import { ExceptionMapper } from '../../exceptions/exception.mapper';
import { BaseException } from '../../exceptions/exceptions.base';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

describe('ExceptionMapper', () => {
  class TestBaseException extends BaseException {
    constructor(message: string, statusCode: number, errorCode?: string) {
      super(message, statusCode, errorCode ?? '');
    }
  }

  it('should return the same HttpException if error is instance of HttpException', () => {
    const httpError = new BadRequestException('bad request');
    const result = ExceptionMapper.mapToHttpException(httpError as any);
    expect(result).toBe(httpError);
  });

  it('should map BaseException with statusCode 400 to BadRequestException', () => {
    const error = new TestBaseException('bad request', 400, 'ERR_400');
    const result = ExceptionMapper.mapToHttpException(error);
    expect(result).toBeInstanceOf(BadRequestException);
    expect(result.getResponse()).toMatchObject({
      message: 'bad request',
      errorCode: 'ERR_400',
      statusCode: 400,
    });
  });

  it('should map BaseException with statusCode 401 to UnauthorizedException', () => {
    const error = new TestBaseException('unauthorized', 401, 'ERR_401');
    const result = ExceptionMapper.mapToHttpException(error);
    expect(result).toBeInstanceOf(UnauthorizedException);
    expect(result.getResponse()).toMatchObject({
      message: 'unauthorized',
      errorCode: 'ERR_401',
      statusCode: 401,
    });
  });

  it('should map BaseException with statusCode 403 to ForbiddenException', () => {
    const error = new TestBaseException('forbidden', 403, 'ERR_403');
    const result = ExceptionMapper.mapToHttpException(error);
    expect(result).toBeInstanceOf(ForbiddenException);
    expect(result.getResponse()).toMatchObject({
      message: 'forbidden',
      errorCode: 'ERR_403',
      statusCode: 403,
    });
  });

  it('should map BaseException with statusCode 404 to NotFoundException', () => {
    const error = new TestBaseException('not found', 404, 'ERR_404');
    const result = ExceptionMapper.mapToHttpException(error);
    expect(result).toBeInstanceOf(NotFoundException);
    expect(result.getResponse()).toMatchObject({
      message: 'not found',
      errorCode: 'ERR_404',
      statusCode: 404,
    });
  });

  it('should map BaseException with statusCode 409 to ConflictException', () => {
    const error = new TestBaseException('conflict', 409, 'ERR_409');
    const result = ExceptionMapper.mapToHttpException(error);
    expect(result).toBeInstanceOf(ConflictException);
    expect(result.getResponse()).toMatchObject({
      message: 'conflict',
      errorCode: 'ERR_409',
      statusCode: 409,
    });
  });

  it('should map BaseException with statusCode 422 to UnprocessableEntityException', () => {
    const error = new TestBaseException('unprocessable', 422, 'ERR_422');
    const result = ExceptionMapper.mapToHttpException(error);
    expect(result).toBeInstanceOf(UnprocessableEntityException);
    expect(result.getResponse()).toMatchObject({
      message: 'unprocessable',
      errorCode: 'ERR_422',
      statusCode: 422,
    });
  });

  it('should map BaseException with statusCode 500 to InternalServerErrorException', () => {
    const error = new TestBaseException('internal error', 500, 'ERR_500');
    const result = ExceptionMapper.mapToHttpException(error);
    expect(result).toBeInstanceOf(InternalServerErrorException);
    expect(result.getResponse()).toMatchObject({
      message: 'internal error',
      errorCode: 'ERR_500',
      statusCode: 500,
    });
  });

  it('should map BaseException with unknown statusCode to InternalServerErrorException', () => {
    const error = new TestBaseException('unknown error', 999, 'ERR_UNKNOWN');
    const result = ExceptionMapper.mapToHttpException(error);
    expect(result).toBeInstanceOf(InternalServerErrorException);
    expect(result.getResponse()).toMatchObject({
      message: 'unknown error',
      errorCode: 'ERR_UNKNOWN',
      statusCode: 999,
    });
  });

  it('should return InternalServerErrorException for non-HttpException and non-BaseException', () => {
    const error = { message: 'other error' } as any;
    const result = ExceptionMapper.mapToHttpException(error);
    expect(result).toBeInstanceOf(InternalServerErrorException);
    expect(result.getResponse()).toMatchObject({
      message: 'Internal server error',
      error: 'Internal Server Error',
      statusCode: 500,
    });
  });
});
