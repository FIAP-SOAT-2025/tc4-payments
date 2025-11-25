import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { bootstrap } from '../main';

jest.mock('@nestjs/core');
jest.mock('@nestjs/swagger', () => ({
  ...jest.requireActual('@nestjs/swagger'),
  ApiProperty: () => (target: any, propertyKey: string) => {},
  DocumentBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addTag: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  })),
  SwaggerModule: {
    createDocument: jest.fn(),
    setup: jest.fn(),
  },
}));

describe('bootstrap', () => {
  let appMock: any;

  beforeEach(() => {
    appMock = {
      useGlobalPipes: jest.fn(),
      useGlobalFilters: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue(appMock);

    (SwaggerModule.createDocument as jest.Mock).mockReturnValue({
      swagger: 'fake-document',
    });

    (SwaggerModule.setup as jest.Mock).mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the app using NestFactory', async () => {
    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
  });

  it('should set up Swagger correctly', async () => {
    await bootstrap();

    const builder = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('The API description')
      .setVersion('1.0')
      .addTag('example')
      .addBearerAuth()
      .build();

    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(
      appMock,
      builder,
    );

    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api',
      appMock,
      { swagger: 'fake-document' },
    );
  });

  it('should configure global validation pipes', async () => {
    await bootstrap();

    expect(appMock.useGlobalPipes).toHaveBeenCalledTimes(1);

    const pipe = (appMock.useGlobalPipes as jest.Mock).mock.calls[0][0];

    expect(pipe).toBeInstanceOf(ValidationPipe);
  });

  it('should call useGlobalFilters', async () => {
    await bootstrap();

    expect(appMock.useGlobalFilters).toHaveBeenCalledTimes(1);
  });

  it('should start listening on provided PORT or default to 3000', async () => {
    process.env.PORT = '5050';

    await bootstrap();

    expect(appMock.listen).toHaveBeenCalledWith('5050');
  });

  it('should listen on port 3000 when PORT env is undefined', async () => {
    delete process.env.PORT;

    await bootstrap();

    expect(appMock.listen).toHaveBeenCalledWith(3000);
  });

});
