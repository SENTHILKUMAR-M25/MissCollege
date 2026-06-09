const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function run() {
  const students = await p.user.findMany({
    where: { role: 'STUDENT' },
    select: { id: true, email: true, isActive: true, passwordChanged: true, password: true }
  })

  console.log('Student users in DB:')
  for (const u of students) {
    console.log(`\nEmail: ${u.email}`)
    console.log(`isActive: ${u.isActive}`)
    const match12345678 = await bcrypt.compare('12345678', u.password)
    console.log(`Password '12345678' matches: ${match12345678}`)
    
    // also test the student from DB
    const student = await p.student.findFirst({ where: { userId: u.id }, select: { dob: true, registerNumber: true } })
    if (student?.dob) {
      const d = new Date(student.dob)
      const dd = String(d.getDate()).padStart(2,'0')
      const mm = String(d.getMonth()+1).padStart(2,'0')
      const yyyy = d.getFullYear()
      const dobPass = `${dd}${mm}${yyyy}`
      const matchDob = await bcrypt.compare(dobPass, u.password)
      console.log(`DOB password '${dobPass}' matches: ${matchDob}`)
    } else {
      console.log('No DOB stored for this student')
    }
    console.log(`Register: ${student?.registerNumber}`)
  }
}

run().catch(console.error).finally(() => p.$disconnect())
