import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing connection...');
    const result = await prisma.$queryRawUnsafe("SELECT 1 as test");
    console.log('Connection OK:', result);

    console.log('Testing contacto create...');
    const contacto = await prisma.contacto.create({
      data: {
        leadId: 'test-lead-1',
        nombre: 'Test Negocio',
        telefono: '+18095550001',
        email: 'test@test.com',
        empresa: 'Test Address',
        fuente: 'Radar Leads Caso 1',
      },
    });
    console.log('Contacto created:', contacto);

    console.log('Testing conversacion create...');
    const conversacion = await prisma.conversacion.create({
      data: {
        contactoId: contacto.id,
        numeroWhatsapp: '+18095550001',
        estado: 'pendiente',
      },
    });
    console.log('Conversacion created:', conversacion);

    console.log('Testing leadCaso1 create...');
    const leadCaso1 = await prisma.leadCaso1.create({
      data: {
        id: 'test-lead-1',
        displayName: 'Test Negocio',
        formattedAddress: 'Test Address',
        phoneNumber: '+18095550001',
        email: 'test@test.com',
        website: 'https://test.com',
        opportunityScore: 85,
        packageType: 'pro',
        packagePrice: '35000',
        siteUrl: 'https://test.pages.dev',
        status: 'Contactado',
      },
    });
    console.log('LeadCaso1 created:', leadCaso1);

  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();