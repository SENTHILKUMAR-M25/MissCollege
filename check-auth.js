const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function run() {
  const faculty = await p.faculty.findMany({
    include: { user: { select: { name: true, email: true, role: true, isActive: true } } }
  })
  console.log('\n=== Faculty ===')
  for (const f of faculty) {
    console.log(`ID: ${f.facultyId} | Name: ${f.user.name} | Role: ${f.user.role} | isHod: ${f.isHod} | DOB: ${f.dateOfBirth} | Active: ${f.user.isActive}`)
  }

  const hods = await p.hodAssignment.findMany({
    where: { isActive: true },
    include: { faculty: { include: { user: { select: { role: true, name: true } } } } }
  })
  console.log('\n=== Active HOD Assignments ===')
  for (const h of hods) {
    console.log(`Faculty: ${h.faculty.user.name} | Role in DB: ${h.faculty.user.role}`)
  }
}

run().catch(console.error).finally(() => p.$disconnect())
