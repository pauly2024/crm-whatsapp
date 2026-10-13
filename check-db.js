const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const tables = await prisma.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', tables);

    // Check for packages-like tables
    for (const t of tables) {
      if (t.table_name.includes('package') || t.table_name.includes('service') || t.table_name.includes('price')) {
        const cols = await prisma.$queryRawUnsafe(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t.table_name}'`);
        console.log(`\n${t.table_name} columns:`, cols);
      }
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
  await prisma.$disconnect();
}
main();