import { BaseException } from "../../../shared/exceptions/exceptions.base";


describe('BaseException', () => {
  const message = 'Test error message';
  const statusCode = 400;
  const errorCode = 'ERR_TEST';

  it('should create an instance with correct properties', () => {
    const exception = new BaseException(message, statusCode, errorCode);

    expect(exception).toBeInstanceOf(Error);
    expect(exception).toBeInstanceOf(BaseException);
    expect(exception.message).toBe(message);
    expect(exception.statusCode).toBe(statusCode);
    expect(exception.errorCode).toBe(errorCode);
  });

  it('should set the name property to the class name', () => {
    const exception = new BaseException(message, statusCode, errorCode);
    expect(['BaseException', 'Error']).toContain(exception.name);
  });

  it('should capture the stack trace', () => {
    const exception = new BaseException(message, statusCode, errorCode);
    expect(exception.stack).toContain(exception.name);
  });

  it('should serialize to JSON correctly', () => {
    const exception = new BaseException(message, statusCode, errorCode);
    const json = exception.toJSON();
    expect(json).toEqual({
      message,
      statusCode,
      errorCode,
    });
  });
});