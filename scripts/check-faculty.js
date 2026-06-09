const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.faculty.count()
  console.log('Faculty count:', count)

  const sample = await prisma.faculty.findMany({
    take: 3,
    select: {
      id: true,
      facultyId: true,
      isHod: true,
      accountStatus: true,
      departmentId: true,
      user: {
        select: {
          name: true,
          email: true,
          isActive: true,
        },
      },
    },
  })

  console.log(JSON.stringify(sample, null, 2))
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
