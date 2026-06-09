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

  const adminHashedPassword = await hashPassword('Miss1980')
  await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'miss@edu.com',
      password: adminHashedPassword,
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

  const apDob = new Date('1998-06-16')
  const apFacultyUser = await prisma.user.create({
    data: {
      name: 'Dr. Priya Sharma',
      email: 'priya@miss.edu',
      password: hashedPassword,
      role: Role.FACULTY,
      passwordChanged: false,
      faculty: {
        create: {
          facultyId: 'MISS-AP-001',
          designation: 'Assistant Professor',
          qualification: 'M.Tech, Ph.D',
          departmentId: csDept.id,
          phone: '+91 9876543212',
          dateOfBirth: apDob,
          gender: 'Female',
          experience: 5,
          joiningDate: new Date('2021-06-01'),
          specialization: 'Data Science, Machine Learning',
          assignedSemesters: '3,4,5',
          assignedSections: 'A,B',
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

  const itDept = departments.get('Information Technology')!

  const hodFaculty = await prisma.user.create({
    data: {
      name: 'Dr. Sarada',
      email: 'sarada@miss.edu',
      password: hashedPassword,
      role: Role.HOD,
      faculty: {
        create: {
          facultyId: 'MISS-HOD-IT-001',
          designation: 'Professor',
          qualification: 'Ph.D in Computer Science',
          departmentId: itDept.id,
          phone: '+91 9876543211',
          dateOfBirth: new Date('1980-01-01'),
          accountStatus: true,
          isHod: true,
        },
      },
    },
    include: { faculty: true },
  })

  await prisma.hodAssignment.create({
    data: {
      departmentId: itDept.id,
      facultyId: hodFaculty.faculty!.id,
      assignedBy: null,
      isActive: true,
    },
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
