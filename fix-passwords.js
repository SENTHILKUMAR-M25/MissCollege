const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function run() {
  // test bcrypt works
  const testHash = await bcrypt.hash('12345678', 10)
  const testMatch = await bcrypt.compare('12345678', testHash)
  console.log('bcrypt self-test:', testMatch, '| hash:', testHash.slice(0,15))

  // check existing hash
  const existingHash = '$2b$10$rWUapqEvuyGQhHBCIg9up.Cfe4GeaFgWlv4TrxYKD2xsfQme6hsTK'
  const checkMatch = await bcrypt.compare('12345678', existingHash)
  console.log('existing hash vs 12345678:', checkMatch)

  // try different passwords
  const passwords = ['12345678', '16062004', '23042005', '28092002', 'password', '123456']
  for (const pw of passwords) {
    const m = await bcrypt.compare(pw, existingHash)
    if (m) console.log('FOUND MATCH:', pw)
  }

  // Reset ALL student passwords to 12345678
  console.log('\nResetting all student passwords to 12345678...')
  const newHash = await bcrypt.hash('12345678', 10)
  const students = await p.user.findMany({ where: { role: 'STUDENT' }, select: { id: true, email: true } })
  for (const u of students) {
    await p.user.update({ where: { id: u.id }, data: { password: newHash, passwordChanged: false } })
    console.log('Reset:', u.email)
  }
  console.log('Done. All students can now login with password: 12345678')
}

run().catch(console.error).finally(() => p.$disconnect())
