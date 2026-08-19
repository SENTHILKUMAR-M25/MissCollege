import { PrismaClient, Role, AttendanceStatus, AccountStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1542596594-649edbc13630?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad56?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150&h=150&fit=crop&crop=face',
]
let avatarIdx = 0
const nextAvatar = () => SAMPLE_AVATARS[avatarIdx++ % SAMPLE_AVATARS.length]

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
      await prisma.department.upsert({
        where: { code: dept.code },
        update: { name: dept.name, description: `Department of ${dept.name}` },
        create: { ...dept, description: `Department of ${dept.name}` },
      })
    )
  }
  const csDept = departments.get('Computer Science')!
  const itDept = departments.get('Information Technology')!

  console.log('Seeding courses...')

  const courseSeeds = [
    {
      code: 'BSC-CS', name: 'B.Sc Computer Science', slug: 'bsc-computer-science', duration: '3 Years', departmentId: csDept.id,
      type: 'Undergraduate', mode: 'Full-Time', seats: 60, fee: '₹45,000 / year', eligibility: '12th with Mathematics & Science (Min. 50%)',
      affiliation: 'Madurai Kamaraj University', accreditation: 'NAAC Grade A',
      bgImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      overview: 'The B.Sc. Computer Science program equips students with a strong foundation in programming, algorithms, data structures, and software engineering.',
      highlights: ['Industry-aligned curriculum updated annually', 'Dedicated programming labs with 24/7 access', 'Internship tie-ups with 50+ IT companies', 'Project-based learning every semester', 'Expert guest lectures from industry professionals', 'Placement assistance with 95%+ record'],
      curriculum: [{ semester: 'Semester I', subjects: ['Programming in C', 'Mathematics I', 'Digital Electronics', 'English Communication', 'Environmental Science'] }, { semester: 'Semester II', subjects: ['Data Structures', 'Mathematics II', 'Object-Oriented Programming (Java)', 'Database Management Systems', 'Web Technologies'] }, { semester: 'Semester III', subjects: ['Operating Systems', 'Computer Networks', 'Software Engineering', 'Python Programming', 'Discrete Mathematics'] }, { semester: 'Semester IV', subjects: ['Algorithms & Complexity', 'Artificial Intelligence', 'Mobile Application Development', 'Cloud Computing', 'Mini Project'] }, { semester: 'Semester V', subjects: ['Machine Learning', 'Cyber Security', 'Big Data Analytics', 'Elective I', 'Internship'] }, { semester: 'Semester VI', subjects: ['Deep Learning', 'IoT & Embedded Systems', 'Elective II', 'Major Project', 'Entrepreneurship'] }],
      faculty: [{ name: 'Dr. A. Rajkumar', designation: 'Head of Department', qualification: 'Ph.D. Computer Science' }, { name: 'Prof. S. Meenakshi', designation: 'Associate Professor', qualification: 'M.Tech, NET' }, { name: 'Dr. K. Venkatesh', designation: 'Assistant Professor', qualification: 'Ph.D. AI & ML' }],
      careerProspects: ['Software Developer / Engineer', 'Data Scientist / Analyst', 'Web & Mobile App Developer', 'System Administrator', 'Cybersecurity Analyst', 'AI / ML Engineer', 'Database Administrator', 'IT Consultant'],
      topRecruiters: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Cognizant', 'Zoho', 'Freshworks', 'Amazon'],
    },
    {
      code: 'BCOM', name: 'B.Com.', slug: 'bcom', duration: '3 Years', departmentId: itDept.id,
      type: 'Undergraduate', mode: 'Full-Time', seats: 80, fee: '₹30,000 / year', eligibility: '12th with Commerce / Any Stream (Min. 45%)',
      affiliation: 'Madurai Kamaraj University', accreditation: 'NAAC Grade A',
      bgImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
      overview: 'The B.Com. program provides comprehensive knowledge of accounting, finance, taxation, and business law.',
      highlights: ['Strong focus on practical accounting & taxation', 'CA / CMA / CS foundation integration', 'Industry visits to banks and financial firms', 'Tally ERP & GST certification included'],
      curriculum: [{ semester: 'Semester I', subjects: ['Financial Accounting', 'Business Economics', 'Business Mathematics', 'English', 'Business Communication'] }, { semester: 'Semester II', subjects: ['Advanced Accounting', 'Business Law', 'Statistics', 'Banking Theory', 'Computer Applications'] }, { semester: 'Semester III', subjects: ['Corporate Accounting', 'Income Tax', 'Cost Accounting', 'Business Management', 'Auditing'] }],
      faculty: [{ name: 'Dr. P. Sundaram', designation: 'Head of Department', qualification: 'Ph.D. Commerce' }],
      careerProspects: ['Chartered Accountant (CA)', 'Company Secretary (CS)', 'Bank Officer / Manager', 'Financial Analyst', 'Tax Consultant'],
      topRecruiters: ['SBI', 'HDFC Bank', 'ICICI Bank', 'Deloitte', 'KPMG', 'EY'],
    },
    {
      code: 'BA-ENG', name: 'B.A. English', slug: 'ba-english', duration: '3 Years', departmentId: itDept.id,
      type: 'Undergraduate', mode: 'Full-Time', seats: 60, fee: '₹25,000 / year', eligibility: '12th in Any Stream (Min. 45%)',
      affiliation: 'Madurai Kamaraj University', accreditation: 'NAAC Grade A',
      bgImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
      overview: 'The B.A. English program develops critical thinking, communication, and literary analysis skills.',
      highlights: ['Rich literary curriculum spanning world literature', 'Creative writing workshops every semester', 'Journalism & media studies integration', 'Language lab with advanced tools'],
      curriculum: [{ semester: 'Semester I', subjects: ['Prose & Fiction', 'Grammar & Composition', 'Indian Writing in English', 'Tamil / Second Language', 'Soft Skills'] }, { semester: 'Semester II', subjects: ['Poetry', 'Drama', 'Linguistics', 'Communication Skills', 'Environmental Studies'] }],
      faculty: [{ name: 'Dr. S. Lakshmi', designation: 'Head of Department', qualification: 'Ph.D. English Literature' }],
      careerProspects: ['Content Writer / Editor', 'Journalist', 'Teacher / Lecturer', 'Translator', 'PR Executive', 'Copywriter'],
      topRecruiters: ['The Hindu', 'Times of India', 'Penguin Books', 'BYJU\'S', 'Unacademy'],
    },
    {
      code: 'MBA', name: 'M.B.A.', slug: 'mba', duration: '2 Years', departmentId: itDept.id,
      type: 'Postgraduate', mode: 'Full-Time', seats: 60, fee: '₹85,000 / year', eligibility: "Any Bachelor's Degree (Min. 50%) + Entrance Exam",
      affiliation: 'Madurai Kamaraj University', accreditation: 'NAAC Grade A | AICTE Approved',
      bgImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
      overview: 'The MBA program develops future business leaders with strong analytical, strategic, and leadership skills.',
      highlights: ['AICTE approved 2-year full-time program', 'Dual specialization available', 'Live industry projects every semester', 'International case study methodology'],
      curriculum: [{ semester: 'Semester I', subjects: ['Management Principles', 'Managerial Economics', 'Financial Accounting', 'Organizational Behaviour', 'Business Statistics'] }, { semester: 'Semester II', subjects: ['Marketing Management', 'Financial Management', 'Human Resource Management', 'Operations Management', 'Business Research Methods'] }],
      faculty: [{ name: 'Dr. R. Krishnamurthy', designation: 'Director, MBA', qualification: 'Ph.D. Management, IIM Alumni' }],
      careerProspects: ['Business Manager', 'Marketing Manager', 'Financial Analyst', 'HR Manager', 'Operations Manager', 'Consultant'],
      topRecruiters: ['Amazon', 'Flipkart', 'Deloitte', 'Accenture', 'HDFC Bank', 'Asian Paints'],
    },
    {
      code: 'MSC-CS', name: 'M.Sc. Computer Science', slug: 'msc-computer-science', duration: '2 Years', departmentId: csDept.id,
      type: 'Postgraduate', mode: 'Full-Time', seats: 30, fee: '₹55,000 / year', eligibility: 'B.Sc. CS / BCA / B.Tech (Min. 50%)',
      affiliation: 'Madurai Kamaraj University', accreditation: 'NAAC Grade A',
      bgImage: 'https://images.unsplash.com/photo-1504221507732-5246c3459473?auto=format&fit=crop&w=1200&q=80',
      overview: 'The M.Sc. Computer Science program offers advanced training in AI, machine learning, cloud computing, and research methodologies.',
      highlights: ['Advanced AI & ML specialization track', 'Research publication support', 'Industry-sponsored capstone projects', 'Access to HPC computing cluster'],
      curriculum: [{ semester: 'Semester I', subjects: ['Advanced Algorithms', 'Advanced DBMS', 'Machine Learning', 'Research Methodology', 'Elective I'] }, { semester: 'Semester II', subjects: ['Deep Learning', 'Cloud & Distributed Computing', 'Natural Language Processing', 'Elective II', 'Mini Project'] }],
      faculty: [{ name: 'Dr. A. Rajkumar', designation: 'Head of Department', qualification: 'Ph.D. Computer Science' }],
      careerProspects: ['AI / ML Engineer', 'Research Scientist', 'Data Engineer', 'Cloud Architect', 'Ph.D. Scholar'],
      topRecruiters: ['Google', 'Microsoft', 'IBM', 'Oracle', 'TCS Research', 'ISRO'],
    },
    {
      code: 'BSW', name: 'B.S.W. Social Work', slug: 'bsw-social-work', duration: '3 Years', departmentId: itDept.id,
      type: 'Undergraduate', mode: 'Full-Time', seats: 60, fee: '₹28,000 / year', eligibility: '12th in Any Stream (Min. 45%)',
      affiliation: 'Madurai Kamaraj University', accreditation: 'NAAC Grade A',
      bgImage: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1200&q=80',
      overview: 'The Bachelor of Social Work program prepares students for professional careers in social welfare and community development.',
      highlights: ['Field work training every semester', 'NGO internship opportunities', 'Community outreach programs', 'Professional counseling workshops'],
      curriculum: [{ semester: 'Semester I', subjects: ['Introduction to Social Work', 'Sociology', 'Psychology', 'English', 'Communication Skills'] }, { semester: 'Semester II', subjects: ['Human Growth & Development', 'Social Case Work', 'Economics', 'Field Work', 'Environmental Studies'] }],
      faculty: [{ name: 'Dr. P. Jaya Kumar', designation: 'Head of Department', qualification: 'Ph.D. Social Work' }],
      careerProspects: ['Social Worker', 'NGO Coordinator', 'Counselor', 'Community Development Officer', 'Human Resource Executive'],
      topRecruiters: ['UNICEF', 'NGOs', 'Hospitals', 'Schools', 'CSR Organizations'],
    },
    {
      code: 'BCOM-CA', name: 'B.Com. Computer Applications', slug: 'bcom-computer-applications', duration: '3 Years', departmentId: itDept.id,
      type: 'Undergraduate', mode: 'Full-Time', seats: 70, fee: '₹35,000 / year', eligibility: '12th Commerce / Any Stream',
      affiliation: 'Madurai Kamaraj University', accreditation: 'NAAC Grade A',
      bgImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
      overview: 'The B.Com Computer Applications program integrates commerce education with modern computer application skills.',
      highlights: ['Accounting software training', 'Tally & GST practical sessions', 'Programming basics included', 'Industry-oriented curriculum'],
      curriculum: [{ semester: 'Semester I', subjects: ['Financial Accounting', 'Business Economics', 'Business Communication', 'Computer Fundamentals', 'English'] }, { semester: 'Semester II', subjects: ['Advanced Financial Accounting', 'Business Statistics', 'Programming in C', 'Office Automation', 'Environmental Studies'] }],
      faculty: [{ name: 'Prof. R. Kumar', designation: 'Head of Department', qualification: 'M.Com, M.Phil' }],
      careerProspects: ['Accountant', 'Tax Consultant', 'Bank Officer', 'ERP Executive', 'Financial Analyst'],
      topRecruiters: ['HDFC', 'ICICI', 'TCS', 'Infosys'],
    },
    {
      code: 'BSC-IT', name: 'B.Sc. Information Technology', slug: 'bsc-information-technology', duration: '3 Years', departmentId: itDept.id,
      type: 'Undergraduate', mode: 'Full-Time', seats: 60, fee: '₹42,000 / year', eligibility: '12th with Mathematics',
      affiliation: 'Madurai Kamaraj University', accreditation: 'NAAC Grade A',
      bgImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      overview: 'The B.Sc Information Technology program focuses on software technologies, networking, databases, and web development.',
      highlights: ['Modern computer labs', 'Cloud & web development training', 'Mini projects every semester', 'Industry internship support'],
      curriculum: [{ semester: 'Semester I', subjects: ['Fundamentals of IT', 'Programming in C', 'Computer Organization', 'Mathematics for Computing', 'English Communication'] }, { semester: 'Semester II', subjects: ['Data Structures', 'Digital Electronics', 'OOP with C++', 'Database Management Systems', 'Environmental Studies'] }],
      faculty: [{ name: 'Dr. A. Rajkumar', designation: 'Head of Department', qualification: 'Ph.D. Computer Science' }],
      careerProspects: ['Web Developer', 'Software Engineer', 'Database Administrator', 'System Analyst'],
      topRecruiters: ['Zoho', 'Infosys', 'TCS', 'Wipro'],
    },
    {
      code: 'BBA', name: 'B.B.A.', slug: 'bba', duration: '3 Years', departmentId: itDept.id,
      type: 'Undergraduate', mode: 'Full-Time', seats: 60, fee: '₹38,000 / year', eligibility: '12th in Any Stream',
      affiliation: 'Madurai Kamaraj University', accreditation: 'NAAC Grade A',
      bgImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
      overview: 'The BBA program develops leadership, entrepreneurship, marketing, finance, and management skills for future business professionals.',
      highlights: ['Industry-oriented learning', 'Business case studies', 'Entrepreneurship workshops', 'Management internships'],
      curriculum: [{ semester: 'Semester I', subjects: ['Principles of Management', 'Business Communication', 'Financial Accounting', 'Business Economics', 'English'] }, { semester: 'Semester II', subjects: ['Organizational Behaviour', 'Business Mathematics', 'Marketing Management', 'Computer Applications in Business', 'Environmental Studies'] }],
      faculty: [{ name: 'Dr. R. Krishnan', designation: 'Head of Department', qualification: 'Ph.D. Management' }],
      careerProspects: ['HR Executive', 'Marketing Executive', 'Business Analyst', 'Entrepreneur'],
      topRecruiters: ['HCL', 'Deloitte', 'Amazon', 'Reliance'],
    },
    {
      code: 'BSC-PSY', name: 'B.Sc. Psychology', slug: 'bsc-psychology', duration: '3 Years', departmentId: itDept.id,
      type: 'Undergraduate', mode: 'Full-Time', seats: 40, fee: '₹32,000 / year', eligibility: '12th in Any Stream',
      affiliation: 'Madurai Kamaraj University', accreditation: 'NAAC Grade A',
      bgImage: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1200&q=80',
      overview: 'The B.Sc Psychology program explores human behavior, counseling, mental health, and psychological assessment techniques.',
      highlights: ['Counseling practical sessions', 'Mental health awareness activities', 'Psychology lab facilities', 'Field visits & case studies'],
      curriculum: [{ semester: 'Semester I', subjects: ['General Psychology', 'Human Development', 'Biological Basis of Behaviour', 'English Communication', 'Environmental Studies'] }, { semester: 'Semester II', subjects: ['Cognitive Psychology', 'Social Psychology', 'Research Methods in Psychology', 'Psychological Statistics', 'Computer Applications'] }],
      faculty: [{ name: 'Dr. S. Priya', designation: 'Head of Department', qualification: 'Ph.D. Psychology' }],
      careerProspects: ['Counselor', 'Psychologist', 'HR Executive', 'Behavior Analyst'],
      topRecruiters: ['Hospitals', 'Schools', 'NGOs', 'Counseling Centers'],
    },
  ]

  for (const course of courseSeeds) {
    await prisma.course.upsert({
      where: { code: course.code },
      update: course,
      create: course,
    })
  }

  console.log('Seeding users...')
  const hashedPassword = await hashPassword('password123')
  const csCourse = await prisma.course.findUnique({ where: { code: 'BSC-CS' } })

  const student = await prisma.user.upsert({
    where: { email: 'john@student.miss.edu' },
    update: { name: 'John Doe', password: hashedPassword, role: Role.STUDENT, avatar: nextAvatar() },
    create: {
      name: 'John Doe',
      email: 'john@student.miss.edu',
      password: hashedPassword,
      role: Role.STUDENT,
      avatar: nextAvatar(),
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

  if (!student.student) {
    throw new Error('Student record missing after upsert')
  }

  const adminHashedPassword = await hashPassword('Miss1980')
  const admin = await prisma.user.upsert({
    where: { email: 'miss@edu.com' },
    update: { name: 'System Admin', password: adminHashedPassword, role: Role.ADMIN, avatar: nextAvatar() },
    create: {
      name: 'System Admin',
      email: 'miss@edu.com',
      password: adminHashedPassword,
      role: Role.ADMIN,
      avatar: nextAvatar(),
    },
  })

  const academicAdminHashedPassword = await hashPassword('Miss1980')
  const academicAdmin = await prisma.user.upsert({
    where: { email: 'academic-admin@miss.edu' },
    update: { name: 'Miss-A-001', password: academicAdminHashedPassword, role: Role.ACADEMIC_ADMIN, avatar: nextAvatar() },
    create: {
      name: 'Miss-A-001',
      email: 'academic-admin@miss.edu',
      password: academicAdminHashedPassword,
      role: Role.ACADEMIC_ADMIN,
      avatar: nextAvatar(),
    },
  })

  const examAdminHashedPassword = await hashPassword('Miss1980')
  const examAdmin = await prisma.user.upsert({
    where: { email: 'exam-admin@miss.edu' },
    update: { name: 'Miss-EA-001', password: examAdminHashedPassword, role: Role.EXAM_ADMIN, avatar: nextAvatar() },
    create: {
      name: 'Miss-EA-001',
      email: 'exam-admin@miss.edu',
      password: examAdminHashedPassword,
      role: Role.EXAM_ADMIN,
      avatar: nextAvatar(),
    },
  })

  await prisma.adminProfile.upsert({
    where: { userId: academicAdmin.id },
    update: {
      adminSubRole: 'ACADEMIC_ADMIN',
      designation: 'Academic Administrator',
      canManageAdmins: false,
      academicModules: ['departments', 'faculty', 'students', 'courses', 'subjects', 'attendance', 'marks', 'hod-management'],
      examModules: [],
    },
    create: {
      userId: academicAdmin.id,
      adminSubRole: 'ACADEMIC_ADMIN',
      designation: 'Academic Administrator',
      canManageAdmins: false,
      academicModules: ['departments', 'faculty', 'students', 'courses', 'subjects', 'attendance', 'marks', 'hod-management'],
      examModules: [],
    },
  })

  await prisma.adminProfile.upsert({
    where: { userId: examAdmin.id },
    update: {
      adminSubRole: 'EXAM_ADMIN',
      designation: 'Examination Administrator',
      canManageAdmins: false,
      academicModules: [],
      examModules: ['exam-types', 'assessment-setup', 'exam-schedule', 'hall-allocation', 'invigilator-assignment', 'marks-verification', 'result-publication', 'gpa-cgpa'],
    },
    create: {
      userId: examAdmin.id,
      adminSubRole: 'EXAM_ADMIN',
      designation: 'Examination Administrator',
      canManageAdmins: false,
      academicModules: [],
      examModules: ['exam-types', 'assessment-setup', 'exam-schedule', 'hall-allocation', 'invigilator-assignment', 'marks-verification', 'result-publication', 'gpa-cgpa'],
    },
  })

  const facultyUser = await prisma.user.upsert({
    where: { email: 'turing@miss.edu' },
    update: { name: 'Dr. Alan Turing', password: hashedPassword, role: Role.FACULTY, avatar: nextAvatar() },
    create: {
      name: 'Dr. Alan Turing',
      email: 'turing@miss.edu',
      password: hashedPassword,
      role: Role.FACULTY,
      avatar: nextAvatar(),
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

  if (!facultyUser.faculty) {
    throw new Error('Faculty record missing after upsert')
  }

  const apDob = new Date('1998-06-16')
  const apJoiningDate = new Date('2026-06-15')
  const apFacultyUser = await prisma.user.upsert({
    where: { email: 'priya@miss.edu' },
    update: { name: 'Dr. Priya Sharma', password: hashedPassword, role: Role.FACULTY, avatar: nextAvatar() },
    create: {
      name: 'Dr. Priya Sharma',
      email: 'priya@miss.edu',
      password: hashedPassword,
      role: Role.FACULTY,
      passwordChanged: false,
      avatar: nextAvatar(),
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
          joiningDate: apJoiningDate,
          specialization: 'Data Science, Machine Learning',
          assignedSemesters: '3,4,5',
          assignedSections: 'A,B',
        },
      },
    },
    include: { faculty: true },
  })

  if (!apFacultyUser.faculty) {
    throw new Error('AP Faculty record missing after upsert')
  }

  console.log('Seeding subjects...')
  const facultyId = facultyUser.faculty.id
  const apFacultyId = apFacultyUser.faculty.id
  await prisma.subject.upsert({
    where: { code: 'CS301' },
    update: { name: 'Data Structures', credits: 4, semester: 3, departmentId: csDept.id, facultyId },
    create: { name: 'Data Structures', code: 'CS301', credits: 4, semester: 3, departmentId: csDept.id, facultyId },
  })
  await prisma.subject.upsert({
    where: { code: 'CS302' },
    update: { name: 'Database Management Systems', credits: 4, semester: 3, departmentId: csDept.id, facultyId },
    create: { name: 'Database Management Systems', code: 'CS302', credits: 4, semester: 3, departmentId: csDept.id, facultyId },
  })
  await prisma.subject.upsert({
    where: { code: 'CS303' },
    update: { name: 'Operating Systems', credits: 3, semester: 4, departmentId: csDept.id, facultyId: apFacultyId },
    create: { name: 'Operating Systems', code: 'CS303', credits: 3, semester: 4, departmentId: csDept.id, facultyId: apFacultyId },
  })

  const subjectCS301 = await prisma.subject.findUnique({ where: { code: 'CS301' } })
  const subjectCS302 = await prisma.subject.findUnique({ where: { code: 'CS302' } })
  const subjectCS303 = await prisma.subject.findUnique({ where: { code: 'CS303' } })

  await prisma.timetable.createMany({
    data: [
      { facultyId: facultyUser.faculty.id, departmentId: csDept.id, subjectId: subjectCS301!.id, className: 'I', section: 'A', dayOfWeek: 1, periodNumber: 1, startTime: '09:00', endTime: '09:50', classroom: 'CR-301', semester: 3 },
      { facultyId: facultyUser.faculty.id, departmentId: csDept.id, subjectId: subjectCS302!.id, className: 'I', section: 'A', dayOfWeek: 1, periodNumber: 2, startTime: '09:50', endTime: '10:40', classroom: 'CR-302', semester: 3 },
      { facultyId: facultyUser.faculty.id, departmentId: csDept.id, subjectId: subjectCS301!.id, className: 'I', section: 'A', dayOfWeek: 2, periodNumber: 1, startTime: '09:00', endTime: '09:50', classroom: 'CR-301', semester: 3 },
      { facultyId: facultyUser.faculty.id, departmentId: csDept.id, subjectId: subjectCS302!.id, className: 'I', section: 'A', dayOfWeek: 2, periodNumber: 2, startTime: '09:50', endTime: '10:40', classroom: 'CR-302', semester: 3 },
      { facultyId: apFacultyUser.faculty.id, departmentId: csDept.id, subjectId: subjectCS303!.id, className: 'I', section: 'A', dayOfWeek: 3, periodNumber: 3, startTime: '11:45', endTime: '12:35', classroom: 'CR-303', semester: 4 },
      { facultyId: apFacultyUser.faculty.id, departmentId: csDept.id, subjectId: subjectCS303!.id, className: 'I', section: 'A', dayOfWeek: 4, periodNumber: 3, startTime: '11:45', endTime: '12:35', classroom: 'CR-303', semester: 4 },
    ],
    skipDuplicates: true,
  })

  const hodFaculty = await prisma.user.upsert({
    where: { email: 'sarada@miss.edu' },
    update: { name: 'Dr. Sarada', password: hashedPassword, role: Role.HOD, avatar: nextAvatar() },
    create: {
      name: 'Dr. Sarada',
      email: 'sarada@miss.edu',
      password: hashedPassword,
      role: Role.HOD,
      avatar: nextAvatar(),
      faculty: {
        create: {
          facultyId: 'MISS-HOD-IT-001',
          designation: 'Professor',
          qualification: 'Ph.D in Computer Science',
          departmentId: itDept.id,
          phone: '+91 9876543211',
          dateOfBirth: new Date('1980-01-01'),
          accountStatus: 'ACTIVE',
          isHod: true,
        },
      },
    },
    include: { faculty: true },
  })

  if (!hodFaculty.faculty) {
    throw new Error('HOD faculty record missing after upsert')
  }

  const hodFacultyRecord = await prisma.faculty.findUnique({
    where: { userId: hodFaculty.id },
    select: { id: true },
  })

  if (!hodFacultyRecord) {
    throw new Error('HOD faculty record not found')
  }

  await prisma.hodAssignment.create({
    data: {
      departmentId: itDept.id,
      facultyId: hodFacultyRecord.id,
      assignedBy: null,
      isActive: true,
    },
  })

  console.log('Seeding enquiries...')
  const sampleEnquiries = [
    { name: 'Kumar R', email: 'kumar@example.com', phone: '+91 9876543210', course: 'B.Sc Computer Science', message: 'Interested in admission for 2026-27.' },
    { name: 'Priya S', email: 'priya@example.com', phone: '+91 9876543211', course: 'MBA', message: 'Requested fee details and eligibility.' },
    { name: 'Arun V', email: 'arun@example.com', phone: '+91 9876543212', course: 'B.Com.', message: 'Hostel facility availability please.' },
  ]
  for (const eq of sampleEnquiries) {
    await prisma.enquiry.create({ data: eq })
  }

  console.log('Seeding applications...')
  const sampleApplications = [
    { name: 'Kumar R', email: 'kumar@example.com', phone: '+91 9876543210', dob: '2004-06-15', gender: 'Male', address: 'Madurai', courseApplied: 'B.Sc Computer Science', department: 'Computer Science', previousSchool: 'ABC Hr Sec', previousBoard: 'State', previousPercent: '92', qualification: '12th', parentName: 'Ramesh', parentPhone: '+91 9876543200', parentOccupation: 'Farmer', source: 'website', applicationNo: 'APP-2026-0001' },
    { name: 'Priya S', email: 'priya@example.com', phone: '+91 9876543211', dob: '2004-07-20', gender: 'Female', address: 'Chennai', courseApplied: 'MBA', department: 'Management Studies', previousSchool: 'XYZ Matric', previousBoard: 'CBSE', previousPercent: '88', qualification: 'BBA', parentName: 'Senthil', parentPhone: '+91 9876543201', parentOccupation: 'Manager', source: 'website', applicationNo: 'APP-2026-0002' },
  ]
  for (const ap of sampleApplications) {
    await prisma.application.create({ data: ap })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
