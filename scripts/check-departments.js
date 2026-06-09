const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const departments = await prisma.department.findMany({
    include: {
      _count: { select: { faculty: true } },
      hodAssignments: { where: { isActive: true } },
    },
  })

  console.log('\n=== Departments ===')
  departments.forEach((dept) => {
    console.log(`ID: ${dept.id}`)
    console.log(`Name: ${dept.name}`)
    console.log(`Code: ${dept.code}`)
    console.log(`Faculty Count: ${dept._count.faculty}`)
    console.log(`Active HOD: ${dept.hodAssignments.length > 0 ? dept.hodAssignments[0].facultyId : 'None'}`)
    console.log('---')
  })

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
