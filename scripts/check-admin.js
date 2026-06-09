const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst()
  console.log(JSON.stringify({ id: user.id, email: user.email, role: user.role }))
  await prisma.$disconnect()
}

main().catch((e) => console.error(e))
