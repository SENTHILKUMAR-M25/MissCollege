import { PrismaClient, Role, AttendanceStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

async function main() {
  console.log('Clearing old data...')
  await prisma.internalMark.deleteMany()
  await prisma.semesterResult.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.student.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.course.deleteMany()
  await prisma.faculty.deleteMany()
  await prisma.department.deleteMany()
  await prisma.user.deleteMany()

  console.log('Seeding departments...')
  const departmentSeeds = [
    { name: 'Information Technology', code: 'IT' },
    { name: 'Computer Science', code: 'CSE' },
    { name: 'Artificial Intelligence', code: 'AI' },
    { name: 'Cyber Security', code: 'CY' },
    { name: 'Electronics & Communication', code: 'ECE' },
    { name: 'Electrical & Electronics', code: 'EEE' },
    { name: 'Mechanical', code: 'ME' },
    { name: 'Civil', code: 'CE' },
    { name: 'MBA', code: 'MBA' },
    { name: 'Mathematics', code: 'MATH' },
    { name: 'Physics', code: 'PHY' },
    { name: 'Chemistry', code: 'CHEM' },
    { name: 'English', code: 'ENG' },
  ]

  const departments = new Map<string, Awaited<ReturnType<typeof prisma.department.create>>>()
  for (const dept of departmentSeeds) {
    departments.set(
      dept.name,
      await prisma.department.create({
        data: {
          ...dept,
          description: `Department of ${dept.name}`,
        },
      })
    )
  }
  const csDept = departments.get('Computer Science')!

  console.log('Seeding courses...')
  const csCourse = await prisma.course.create({
    data: {
      name: 'B.Sc Computer Science',
      code: 'BSC-CS',
      duration: '3 Years',
      departmentId: csDept.id,
    },
  })

  console.log('Seeding users...')
  const hashedPassword = await hashPassword('password123')

  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@miss.edu',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  })

  const facultyUser = await prisma.user.create({
    data: {
      name: 'Dr. Alan Turing',
      email: 'turing@miss.edu',
      password: hashedPassword,
      role: Role.FACULTY,
      faculty: {
        create: {
          facultyId: 'MISS-P-001',
          designation: 'Professor',
          qualification: 'Ph.D in Computer Science',
          departmentId: csDept.id,
          phone: '+91 9876543210',
        },
      },
    },
    include: { faculty: true },
  })

  console.log('Seeding subjects...')
  const facultyId = facultyUser.faculty?.id
  if (!facultyId) {
    throw new Error('Failed to create faculty record')
  }

  await prisma.subject.create({
    data: {
      name: 'Data Structures',
      code: 'CS301',
      credits: 4,
      semester: 3,
      departmentId: csDept.id,
      facultyId,
    },
  })

  console.log('Seeding students...')
  await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@student.miss.edu',
      password: hashedPassword,
      role: Role.STUDENT,
      student: {
        create: {
          registerNumber: '22CS001',
          departmentId: csDept.id,
          courseId: csCourse.id,
          semester: 3,
          section: 'A',
          admissionYear: 2022,
          phone: '+91 9123456780',
        },
      },
    },
    include: { student: true },
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
