import {
  PrismaClient,
  PaymentType,
  PaymentStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Limpar banco de dados (opcional, mas útil para desenvolvimento)
  await cleanDatabase();

  await prisma.payment.create({
    data: {
      status: PaymentStatus.APPROVED,
      type: PaymentType.PIX,
      orderId: "1",
      qrCode: "00020126580014br.gov.bcb.pix0136b76aa9c2-2ec4-4110-954e-ebfe34f05b615204000053039865406157.205802BR5925DIkGwOMywWUXuWnQWchGHFiZE6009Sao Paulo62230519mpqrinter1340016447630411F6",
      mercadoPagoPaymentId: "1340016447",
    },
  });

  await prisma.payment.create({
    data: {
      status: PaymentStatus.APPROVED,
      type: PaymentType.PIX,
      orderId: "2",
      qrCode: "00020126580014br.gov.bcb.pix0136b76aa9c2-2ec4-4110-954e-ebfe34f05b615204000053039865406157.205802BR5925DIkGwOMywWUXuWnQWchGHFiZE6009Sao Paulo62230519mpqrinter1340016447630411F6",
      mercadoPagoPaymentId: "1340016447",
    },
  });

  console.log('Seed executado com sucesso!');
}

// Função para limpar o banco antes de inserir novos dados
async function cleanDatabase() {
  await prisma.payment.deleteMany({});
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
