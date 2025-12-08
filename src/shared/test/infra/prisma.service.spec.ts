import { PrismaService } from '../../infra/prisma.service';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = new PrismaService();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await prismaService.$disconnect();
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('should call $connect on onModuleInit', async () => {
    const connectSpy = jest.spyOn(prismaService, '$connect').mockResolvedValue();
    await prismaService.onModuleInit();
    expect(connectSpy).toHaveBeenCalled();
  });

  it('should call $disconnect on onModuleDestroy', async () => {
    const disconnectSpy = jest.spyOn(prismaService, '$disconnect').mockResolvedValue();
    await prismaService.onModuleDestroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});