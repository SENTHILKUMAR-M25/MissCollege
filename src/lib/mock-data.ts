// ─── TYPES ──────────────────────────────────────────────────────────────────
export type Role = "ADMIN" | "FACULTY" | "STUDENT"
export type Status = "Active" | "Inactive"

export interface Department {
  id: string
  name: string
  code: string
  hod: string
  students: number
  faculty: number
  courses: number
  established: number
  color: string
}

export interface Course {
  id: string
  name: string
  code: string
  department: string
  departmentId: string
  duration: string
  seats: number
  enrolled: number
}

export interface Subject {
  id: string
  name: string
  code: string
  department: string
  course: string
  semester: number
  credits: number
  faculty: string
  type: "Theory" | "Practical"
}

export interface Student {
  id: string
  registerNumber: string
  name: string
  email: string
  department: string
  departmentId: string
  course: string
  semester: number
  section: string
  phone: string
  admissionYear: number
  status: Status
  attendance: number
  cgpa: number
  photo?: string
}

export interface Faculty {
  id: string
  facultyId: string
  name: string
  email: string
  department: string
  departmentId: string
  designation: string
  qualification: string
  phone: string
  experience: number
  subjects: string[]
  status: Status
  joinDate: string
}

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  registerNumber: string
  department: string
  subject: string
  semester: number
  present: number
  total: number
  percentage: number
  status: "Safe" | "Warning" | "Defaulter"
}

export interface MarkRecord {
  id: string
  registerNumber: string
  studentName: string
  subjectCode: string
  subjectName: string
  department: string
  semester: number
  cat1: number
  cat2: number
  assignment: number
  total: number
}

export interface Notice {
  id: string
  title: string
  content: string
  category: string
  audience: "All" | "Students" | "Faculty"
  priority: "Low" | "Medium" | "High"
  publishedAt: string
  expiresAt: string
  author: string
  views: number
  isActive: boolean
}

export interface Activity {
  id: string
  type: "student_added" | "faculty_added" | "attendance_updated" | "result_published" | "notice_created" | "mark_entered"
  title: string
  description: string
  time: string
  user: string
  icon: string
}

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
export const departments: Department[] = [
  { id: "d1", name: "Computer Science", code: "CS", hod: "Dr. Rajkumar P", students: 480, faculty: 18, courses: 4, established: 1998, color: "blue" },
  { id: "d2", name: "Business Administration", code: "BA", hod: "Dr. Meena S", students: 520, faculty: 22, courses: 3, established: 1995, color: "purple" },
  { id: "d3", name: "Tamil Literature", code: "TL", hod: "Prof. Suresh M", students: 310, faculty: 14, courses: 2, established: 1985, color: "green" },
  { id: "d4", name: "Mathematics", code: "MA", hod: "Dr. Kavitha R", students: 290, faculty: 12, courses: 3, established: 1990, color: "orange" },
  { id: "d5", name: "Physics", code: "PH", hod: "Dr. Anand K", students: 240, faculty: 10, courses: 2, established: 1988, color: "red" },
  { id: "d6", name: "Chemistry", code: "CH", hod: "Dr. Priya L", students: 220, faculty: 9, courses: 2, established: 1989, color: "yellow" },
  { id: "d7", name: "Social Work", code: "SW", hod: "Prof. Nirmala T", students: 180, faculty: 8, courses: 2, established: 2000, color: "pink" },
  { id: "d8", name: "English Literature", code: "EL", hod: "Dr. Sundaram V", students: 260, faculty: 11, courses: 2, established: 1992, color: "teal" },
]

// ─── COURSES ─────────────────────────────────────────────────────────────────
export const courses: Course[] = [
  { id: "c1", name: "B.Sc Computer Science", code: "BSC-CS", department: "Computer Science", departmentId: "d1", duration: "3 Years", seats: 120, enrolled: 108 },
  { id: "c2", name: "B.C.A", code: "BCA", department: "Computer Science", departmentId: "d1", duration: "3 Years", seats: 60, enrolled: 58 },
  { id: "c3", name: "M.Sc Computer Science", code: "MSC-CS", department: "Computer Science", departmentId: "d1", duration: "2 Years", seats: 40, enrolled: 36 },
  { id: "c4", name: "B.B.A", code: "BBA", department: "Business Administration", departmentId: "d2", duration: "3 Years", seats: 120, enrolled: 115 },
  { id: "c5", name: "B.Com", code: "BCOM", department: "Business Administration", departmentId: "d2", duration: "3 Years", seats: 120, enrolled: 118 },
  { id: "c6", name: "M.B.A", code: "MBA", department: "Business Administration", departmentId: "d2", duration: "2 Years", seats: 60, enrolled: 54 },
  { id: "c7", name: "B.A Tamil", code: "BA-TL", department: "Tamil Literature", departmentId: "d3", duration: "3 Years", seats: 80, enrolled: 76 },
  { id: "c8", name: "M.A Tamil", code: "MA-TL", department: "Tamil Literature", departmentId: "d3", duration: "2 Years", seats: 40, enrolled: 38 },
  { id: "c9", name: "B.Sc Mathematics", code: "BSC-MA", department: "Mathematics", departmentId: "d4", duration: "3 Years", seats: 80, enrolled: 72 },
  { id: "c10", name: "B.Sc Physics", code: "BSC-PH", department: "Physics", departmentId: "d5", duration: "3 Years", seats: 60, enrolled: 55 },
]

// ─── SUBJECTS ────────────────────────────────────────────────────────────────
export const subjects: Subject[] = [
  { id: "s1", name: "Data Structures & Algorithms", code: "CS301", department: "Computer Science", course: "B.Sc CS", semester: 3, credits: 4, faculty: "Dr. Anitha K", type: "Theory" },
  { id: "s2", name: "Database Management Systems", code: "CS302", department: "Computer Science", course: "B.Sc CS", semester: 3, credits: 4, faculty: "Mr. Selvam R", type: "Theory" },
  { id: "s3", name: "DBMS Lab", code: "CS302L", department: "Computer Science", course: "B.Sc CS", semester: 3, credits: 2, faculty: "Mr. Selvam R", type: "Practical" },
  { id: "s4", name: "Web Technologies", code: "CS401", department: "Computer Science", course: "B.Sc CS", semester: 4, credits: 4, faculty: "Ms. Preethi N", type: "Theory" },
  { id: "s5", name: "Management Principles", code: "BA101", department: "Business Administration", course: "BBA", semester: 1, credits: 3, faculty: "Dr. Meena S", type: "Theory" },
  { id: "s6", name: "Financial Accounting", code: "BA201", department: "Business Administration", course: "BBA", semester: 2, credits: 4, faculty: "Prof. Rajan M", type: "Theory" },
  { id: "s7", name: "Calculus", code: "MA101", department: "Mathematics", course: "B.Sc Mathematics", semester: 1, credits: 4, faculty: "Dr. Kavitha R", type: "Theory" },
  { id: "s8", name: "Classical Tamil", code: "TL101", department: "Tamil Literature", course: "B.A Tamil", semester: 1, credits: 3, faculty: "Prof. Suresh M", type: "Theory" },
]

// ─── STUDENTS ────────────────────────────────────────────────────────────────
export const students: Student[] = [
  { id: "st1", registerNumber: "22CS001", name: "Aravind Kumar S", email: "aravind@student.miss.edu", department: "Computer Science", departmentId: "d1", course: "B.Sc CS", semester: 5, section: "A", phone: "9876543210", admissionYear: 2022, status: "Active", attendance: 88, cgpa: 8.4 },
  { id: "st2", registerNumber: "22CS002", name: "Priya Dharshini R", email: "priya@student.miss.edu", department: "Computer Science", departmentId: "d1", course: "B.Sc CS", semester: 5, section: "A", phone: "9876543211", admissionYear: 2022, status: "Active", attendance: 92, cgpa: 9.1 },
  { id: "st3", registerNumber: "22CS003", name: "Mohamed Rizwan A", email: "rizwan@student.miss.edu", department: "Computer Science", departmentId: "d1", course: "B.Sc CS", semester: 5, section: "B", phone: "9876543212", admissionYear: 2022, status: "Active", attendance: 74, cgpa: 7.2 },
  { id: "st4", registerNumber: "22BA001", name: "Kavitha Lakshmi P", email: "kavitha@student.miss.edu", department: "Business Administration", departmentId: "d2", course: "BBA", semester: 5, section: "A", phone: "9876543213", admissionYear: 2022, status: "Active", attendance: 95, cgpa: 9.5 },
  { id: "st5", registerNumber: "22BA002", name: "Santhosh Raj T", email: "santhosh@student.miss.edu", department: "Business Administration", departmentId: "d2", course: "BBA", semester: 5, section: "A", phone: "9876543214", admissionYear: 2022, status: "Active", attendance: 81, cgpa: 8.0 },
  { id: "st6", registerNumber: "23CS001", name: "Nithya Sri V", email: "nithya@student.miss.edu", department: "Computer Science", departmentId: "d1", course: "B.Sc CS", semester: 3, section: "A", phone: "9876543215", admissionYear: 2023, status: "Active", attendance: 67, cgpa: 6.8 },
  { id: "st7", registerNumber: "23CS002", name: "Balaji Murugan K", email: "balaji@student.miss.edu", department: "Computer Science", departmentId: "d1", course: "B.Sc CS", semester: 3, section: "B", phone: "9876543216", admissionYear: 2023, status: "Active", attendance: 78, cgpa: 7.6 },
  { id: "st8", registerNumber: "22MA001", name: "Saranya Devi M", email: "saranya@student.miss.edu", department: "Mathematics", departmentId: "d4", course: "B.Sc Mathematics", semester: 5, section: "A", phone: "9876543217", admissionYear: 2022, status: "Active", attendance: 91, cgpa: 8.9 },
  { id: "st9", registerNumber: "22TL001", name: "Mahalakshmi K", email: "maha@student.miss.edu", department: "Tamil Literature", departmentId: "d3", course: "B.A Tamil", semester: 5, section: "A", phone: "9876543218", admissionYear: 2022, status: "Active", attendance: 88, cgpa: 8.2 },
  { id: "st10", registerNumber: "23BA001", name: "Dinesh Babu R", email: "dinesh@student.miss.edu", department: "Business Administration", departmentId: "d2", course: "BBA", semester: 3, section: "A", phone: "9876543219", admissionYear: 2023, status: "Inactive", attendance: 45, cgpa: 5.5 },
  { id: "st11", registerNumber: "22PH001", name: "Anitha Kumari S", email: "anitha@student.miss.edu", department: "Physics", departmentId: "d5", course: "B.Sc Physics", semester: 5, section: "A", phone: "9876543220", admissionYear: 2022, status: "Active", attendance: 86, cgpa: 8.1 },
  { id: "st12", registerNumber: "23CS003", name: "Karthik Rajan V", email: "karthik@student.miss.edu", department: "Computer Science", departmentId: "d1", course: "B.Sc CS", semester: 3, section: "A", phone: "9876543221", admissionYear: 2023, status: "Active", attendance: 79, cgpa: 7.4 },
]

// ─── FACULTY ─────────────────────────────────────────────────────────────────
export const faculty: Faculty[] = [
  { id: "f1", facultyId: "MISS-HOD-001", name: "Dr. Rajkumar P", email: "rajkumar@miss.edu", department: "Computer Science", departmentId: "d1", designation: "Head of Department", qualification: "Ph.D CS", phone: "9876501001", experience: 20, subjects: ["CS301", "CS501"], status: "Active", joinDate: "2004-06-01" },
  { id: "f2", facultyId: "MISS-AP-001", name: "Dr. Anitha K", email: "anitha@miss.edu", department: "Computer Science", departmentId: "d1", designation: "Associate Professor", qualification: "Ph.D CS", phone: "9876501002", experience: 14, subjects: ["CS301", "CS302"], status: "Active", joinDate: "2010-07-15" },
  { id: "f3", facultyId: "MISS-ASP-001", name: "Mr. Selvam R", email: "selvam@miss.edu", department: "Computer Science", departmentId: "d1", designation: "Assistant Professor", qualification: "M.E", phone: "9876501003", experience: 8, subjects: ["CS302", "CS302L"], status: "Active", joinDate: "2016-06-01" },
  { id: "f4", facultyId: "MISS-ASP-002", name: "Ms. Preethi N", email: "preethi@miss.edu", department: "Computer Science", departmentId: "d1", designation: "Assistant Professor", qualification: "M.Sc CS", phone: "9876501004", experience: 5, subjects: ["CS401"], status: "Active", joinDate: "2019-07-01" },
  { id: "f5", facultyId: "MISS-P-001", name: "Dr. Meena S", email: "meena@miss.edu", department: "Business Administration", departmentId: "d2", designation: "Professor", qualification: "Ph.D MBA", phone: "9876501005", experience: 22, subjects: ["BA101"], status: "Active", joinDate: "2002-06-01" },
  { id: "f6", facultyId: "MISS-AP-002", name: "Prof. Rajan M", email: "rajan@miss.edu", department: "Business Administration", departmentId: "d2", designation: "Associate Professor", qualification: "MBA", phone: "9876501006", experience: 16, subjects: ["BA201"], status: "Active", joinDate: "2008-07-01" },
  { id: "f7", facultyId: "MISS-HOD-002", name: "Dr. Kavitha R", email: "kavitha@miss.edu", department: "Mathematics", departmentId: "d4", designation: "Head of Department", qualification: "Ph.D Maths", phone: "9876501007", experience: 18, subjects: ["MA101"], status: "Active", joinDate: "2006-06-01" },
  { id: "f8", facultyId: "MISS-HOD-003", name: "Prof. Suresh M", email: "suresh@miss.edu", department: "Tamil Literature", departmentId: "d3", designation: "Head of Department", qualification: "M.A Tamil", phone: "9876501008", experience: 25, subjects: ["TL101"], status: "Active", joinDate: "1999-06-01" },
  { id: "f9", facultyId: "MISS-HOD-004", name: "Dr. Anand K", email: "anand@miss.edu", department: "Physics", departmentId: "d5", designation: "Head of Department", qualification: "Ph.D Physics", phone: "9876501009", experience: 19, subjects: [], status: "Active", joinDate: "2005-06-01" },
  { id: "f10", facultyId: "MISS-ASP-003", name: "Ms. Lakshmi T", email: "lakshmi@miss.edu", department: "Computer Science", departmentId: "d1", designation: "Assistant Professor", qualification: "M.Sc IT", phone: "9876501010", experience: 3, subjects: [], status: "Inactive", joinDate: "2021-07-01" },
]

// ─── ATTENDANCE ──────────────────────────────────────────────────────────────
export const attendanceRecords: AttendanceRecord[] = [
  { id: "a1", studentId: "st1", studentName: "Aravind Kumar S", registerNumber: "22CS001", department: "Computer Science", subject: "Data Structures", semester: 5, present: 44, total: 50, percentage: 88, status: "Safe" },
  { id: "a2", studentId: "st2", studentName: "Priya Dharshini R", registerNumber: "22CS002", department: "Computer Science", subject: "Data Structures", semester: 5, present: 46, total: 50, percentage: 92, status: "Safe" },
  { id: "a3", studentId: "st3", studentName: "Mohamed Rizwan A", registerNumber: "22CS003", department: "Computer Science", subject: "Data Structures", semester: 5, present: 37, total: 50, percentage: 74, status: "Warning" },
  { id: "a4", studentId: "st6", studentName: "Nithya Sri V", registerNumber: "23CS001", department: "Computer Science", subject: "Data Structures", semester: 3, present: 33, total: 50, percentage: 67, status: "Defaulter" },
  { id: "a5", studentId: "st10", studentName: "Dinesh Babu R", registerNumber: "23BA001", department: "Business Administration", subject: "Management Principles", semester: 3, present: 22, total: 50, percentage: 45, status: "Defaulter" },
  { id: "a6", studentId: "st4", studentName: "Kavitha Lakshmi P", registerNumber: "22BA001", department: "Business Administration", subject: "Management Principles", semester: 5, present: 47, total: 50, percentage: 95, status: "Safe" },
  { id: "a7", studentId: "st7", studentName: "Balaji Murugan K", registerNumber: "23CS002", department: "Computer Science", subject: "Web Technologies", semester: 3, present: 39, total: 50, percentage: 78, status: "Warning" },
  { id: "a8", studentId: "st8", studentName: "Saranya Devi M", registerNumber: "22MA001", department: "Mathematics", subject: "Calculus", semester: 5, present: 45, total: 50, percentage: 91, status: "Safe" },
]

// ─── MARKS ───────────────────────────────────────────────────────────────────
export const markRecords: MarkRecord[] = [
  { id: "m1", registerNumber: "22CS001", studentName: "Aravind Kumar S", subjectCode: "CS301", subjectName: "Data Structures", department: "Computer Science", semester: 5, cat1: 22, cat2: 24, assignment: 9, total: 55 },
  { id: "m2", registerNumber: "22CS002", studentName: "Priya Dharshini R", subjectCode: "CS301", subjectName: "Data Structures", department: "Computer Science", semester: 5, cat1: 25, cat2: 26, assignment: 10, total: 61 },
  { id: "m3", registerNumber: "22CS003", studentName: "Mohamed Rizwan A", subjectCode: "CS301", subjectName: "Data Structures", department: "Computer Science", semester: 5, cat1: 18, cat2: 19, assignment: 8, total: 45 },
  { id: "m4", registerNumber: "22BA001", studentName: "Kavitha Lakshmi P", subjectCode: "BA101", subjectName: "Management Principles", department: "Business Administration", semester: 5, cat1: 26, cat2: 27, assignment: 10, total: 63 },
  { id: "m5", registerNumber: "22BA002", studentName: "Santhosh Raj T", subjectCode: "BA101", subjectName: "Management Principles", department: "Business Administration", semester: 5, cat1: 21, cat2: 23, assignment: 9, total: 53 },
]

// ─── NOTICES ─────────────────────────────────────────────────────────────────
export const notices: Notice[] = [
  { id: "n1", title: "End Semester Examination Schedule - Nov 2025", content: "The end semester examinations for all UG and PG programmes will commence from November 15, 2025. Students are requested to download their hall tickets from the college portal.", category: "Examination", audience: "Students", priority: "High", publishedAt: "2025-10-20T09:00:00", expiresAt: "2025-11-20T00:00:00", author: "Controller of Examinations", views: 1240, isActive: true },
  { id: "n2", title: "Faculty Development Programme - December 2025", content: "A two-day Faculty Development Programme on 'Modern Teaching Methodologies' will be conducted on December 5-6, 2025. All faculty members are requested to register.", category: "Training", audience: "Faculty", priority: "Medium", publishedAt: "2025-11-01T10:00:00", expiresAt: "2025-12-06T00:00:00", author: "IQAC Coordinator", views: 342, isActive: true },
  { id: "n3", title: "Scholarship Application Open - 2025-26", content: "Applications for Government and Management scholarships for the academic year 2025-26 are now open. Eligible students must apply before December 31, 2025.", category: "Scholarship", audience: "Students", priority: "High", publishedAt: "2025-11-15T09:00:00", expiresAt: "2025-12-31T00:00:00", author: "Scholarship Coordinator", views: 890, isActive: true },
  { id: "n4", title: "Annual Sports Day - January 2026", content: "The Annual Sports Day will be held on January 15, 2026. Students interested in participating in various events must register with their respective Physical Education In-charges.", category: "Sports", audience: "All", priority: "Low", publishedAt: "2025-12-01T09:00:00", expiresAt: "2026-01-15T00:00:00", author: "Physical Education Director", views: 2100, isActive: true },
  { id: "n5", title: "Internal Assessment Dates - Semester V", content: "Internal assessment tests for Semester V will be conducted from October 10-15, 2025. Detailed timetable will be communicated by respective departments.", category: "Examination", audience: "Students", priority: "High", publishedAt: "2025-10-01T09:00:00", expiresAt: "2025-10-20T00:00:00", author: "Principal", views: 1560, isActive: false },
  { id: "n6", title: "Library Book Return Notice", content: "All students and faculty are requested to return library books before December 20, 2025 for annual stock verification.", category: "Library", audience: "All", priority: "Medium", publishedAt: "2025-12-05T09:00:00", expiresAt: "2025-12-20T00:00:00", author: "Librarian", views: 780, isActive: true },
]

// ─── ACTIVITIES ──────────────────────────────────────────────────────────────
export const recentActivities: Activity[] = [
  { id: "act1", type: "student_added", title: "New Student Enrolled", description: "Karthik Rajan V (23CS003) enrolled in B.Sc CS Semester 3", time: "2025-12-03T14:30:00", user: "Admission Office", icon: "UserPlus" },
  { id: "act2", type: "result_published", title: "Results Published", description: "Semester IV results published for Computer Science dept.", time: "2025-12-03T11:00:00", user: "Dr. Rajkumar P", icon: "FileCheck" },
  { id: "act3", type: "attendance_updated", title: "Attendance Updated", description: "November attendance updated for all departments", time: "2025-12-02T16:00:00", user: "System", icon: "CalendarCheck" },
  { id: "act4", type: "notice_created", title: "Notice Created", description: "Scholarship application notice published for students", time: "2025-11-15T09:00:00", user: "Admin", icon: "Bell" },
  { id: "act5", type: "faculty_added", title: "Faculty Onboarded", description: "Ms. Lakshmi T joined Computer Science department", time: "2025-11-01T10:00:00", user: "HR Dept", icon: "UserCheck" },
  { id: "act6", type: "mark_entered", title: "Internal Marks Entered", description: "CAT-2 marks entered for CS301 - Data Structures", time: "2025-10-28T14:00:00", user: "Dr. Anitha K", icon: "ClipboardEdit" },
]

// ─── CHART DATA ──────────────────────────────────────────────────────────────
export const studentsByDept = departments.map((d) => ({ name: d.code, students: d.students, fill: "#6366f1" }))

export const monthlyAttendance = [
  { month: "Jul", percentage: 88 },
  { month: "Aug", percentage: 84 },
  { month: "Sep", percentage: 91 },
  { month: "Oct", percentage: 79 },
  { month: "Nov", percentage: 86 },
  { month: "Dec", percentage: 82 },
]

export const semesterPassRate = [
  { semester: "Sem I", pass: 96, fail: 4 },
  { semester: "Sem II", pass: 93, fail: 7 },
  { semester: "Sem III", pass: 89, fail: 11 },
  { semester: "Sem IV", pass: 91, fail: 9 },
  { semester: "Sem V", pass: 88, fail: 12 },
  { semester: "Sem VI", pass: 94, fail: 6 },
]

export const facultyByDept = departments.slice(0, 6).map((d) => ({
  name: d.code,
  value: d.faculty,
}))

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────
export const dashboardStats = {
  totalStudents: students.length + 2488,
  totalFaculty: faculty.length + 94,
  totalDepartments: departments.length,
  totalCourses: courses.length,
  totalSubjects: subjects.length + 62,
  activeNotices: notices.filter((n) => n.isActive).length,
  studentGrowth: 8.2,
  facultyGrowth: 3.1,
  attendanceAvg: 84.6,
  passRate: 91.2,
}
