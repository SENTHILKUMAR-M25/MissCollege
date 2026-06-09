"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/permissions"

export async function getPeriods() {
  try {
    const periods = await prisma.period.findMany({ orderBy: { displayOrder: "asc" } })
    return { success: true, data: periods }
  } catch (error) {
    console.error("Error fetching periods:", error)
    return { success: false, error: "Failed to fetch periods" }
  }
}

export async function savePeriods(periods: { periodNumber: number; name: string; startTime: string; endTime: string; isBreak: boolean; displayOrder: number }[], facultyUserId: string) {
  try {
    const session = await getSession()
    if (!session?.user || session.user.role !== "HOD") return { success: false, error: "Unauthorized" }

    const hod = await prisma.faculty.findUnique({
      where: { userId: facultyUserId },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }

    await prisma.$transaction([
      prisma.period.deleteMany({}),
      ...periods.map((p) =>
        prisma.period.create({
          data: {
            periodNumber: p.periodNumber,
            name: p.name,
            startTime: p.startTime,
            endTime: p.endTime,
            isBreak: p.isBreak,
            displayOrder: p.displayOrder,
          },
        })
      ),
    ])

    revalidatePath("/hod/timetable")
    return { success: true, message: "Period timings saved successfully" }
  } catch (error) {
    console.error("Error saving periods:", error)
    return { success: false, error: "Failed to save periods" }
  }
}

export async function generateTimetable(data: {
  departmentId: string
  className: string
  section: string
  semester: number
  courseId?: string
  academicYear: string
  workingDays?: number[]
  excludeBreaks?: boolean
  maxConsecutiveSameSubject?: number
  facultyUserId: string
}) {
  try {
    const session = await getSession()
    if (!session?.user || session.user.role !== "HOD") return { success: false, error: "Unauthorized" }

    const hod = await prisma.faculty.findUnique({
      where: { userId: data.facultyUserId },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }
    if (hod.departmentId !== data.departmentId) return { success: false, error: "Forbidden" }

    const workingDays = data.workingDays || [1, 2, 3, 4, 5]
    const excludeBreaks = data.excludeBreaks !== false
    const maxConsecutive = data.maxConsecutiveSameSubject || 2

    const [subjects, existingEntries, commonPeriods, classStudents] = await Promise.all([
      prisma.subject.findMany({
        where: { departmentId: data.departmentId, semester: data.semester, isActive: true },
        include: { faculty: { include: { user: { select: { name: true } } } } },
      }),
      prisma.timetable.findMany({
        where: { departmentId: data.departmentId, className: data.className, section: data.section, semester: data.semester },
      }),
      prisma.period.findMany({ orderBy: { displayOrder: "asc" } }),
      prisma.student.count({ where: { departmentId: data.departmentId, semester: data.semester, section: data.section } }),
    ])

    if (subjects.length === 0) return { success: false, error: "No subjects found for this semester" }
    if (commonPeriods.length === 0) return { success: false, error: "No period timings configured. Please configure periods first." }

    const targetHours: Record<string, number> = {}
    for (const s of subjects) {
      const hours = s.totalHoursPerWeek || Math.max(1, Math.ceil(s.credits))
      targetHours[s.id] = hours
    }

    const occupiedFaculty = new Map<string, string[]>()
    const occupiedClassroom = new Map<string, string[]>()
    const occupiedSection = new Map<string, string[]>()

    const slotKey = (day: number, periodNum: number) => `${day}|${periodNum}`

    const allEntries = [...existingEntries]

    for (const t of allEntries) {
      const fKey = slotKey(t.dayOfWeek, t.periodNumber || 0)
      const cKey = slotKey(t.dayOfWeek, t.periodNumber || 0)
      const sKey = slotKey(t.dayOfWeek, t.periodNumber || 0)
      occupiedFaculty.set(fKey, [...(occupiedFaculty.get(fKey) || []), t.facultyId])
      occupiedClassroom.set(cKey, [...(occupiedClassroom.get(cKey) || []), t.classroom])
      occupiedSection.set(sKey, [...(occupiedSection.get(sKey) || []), `${t.className}|${t.section}`])
    }

    const pending = subjects
      .map(s => ({ subject: s, remaining: targetHours[s.id] }))
      .sort((a, b) => b.remaining - a.remaining)

    const generated: any[] = []
    const unscheduled: any[] = []

    const facultyLastPeriod = new Map<string, { day: number; period: number; subjectId: string }>()
    const subjectLastPeriod = new Map<string, { day: number; period: number }>()

    function isPeriodAvailable(day: number, periodNum: number, facultyId: string, classroom: string, subjectId: string): boolean {
      const key = slotKey(day, periodNum)
      const period = commonPeriods.find(p => p.periodNumber === periodNum)
      if (excludeBreaks && period?.isBreak) return false

      const facultyAtSlot = occupiedFaculty.get(key) || []
      if (facultyAtSlot.includes(facultyId)) return false

      const classroomAtSlot = occupiedClassroom.get(key) || []
      if (classroomAtSlot.includes(classroom)) return false

      const sectionAtSlot = occupiedSection.get(key) || []
      if (sectionAtSlot.includes(`${data.className}|${data.section}`)) return false

      const last = facultyLastPeriod.get(facultyId)
      if (last && last.day === day && last.subjectId === subjectId) {
        const consecutiveCount = getConsecutiveCount(facultyId, day, periodNum, subjectId, allEntries)
        if (consecutiveCount >= maxConsecutive) return false
      }

      return true
    }

    function getConsecutiveCount(facultyId: string, day: number, startPeriod: number, subjectId: string, entries: any[]): number {
      let count = 1
      for (let p = startPeriod - 1; p >= 1; p--) {
        const key = slotKey(day, p)
        const entriesAtSlot = allEntries.filter((e) => {
          const k = slotKey(e.dayOfWeek, e.periodNumber || 0)
          return k === key && e.facultyId === facultyId && e.subjectId === subjectId
        })
        if (entriesAtSlot.length > 0) count++
        else break
      }
      return count
    }

    function getAvailablePeriodIndices(day: number): { periodNum: number; startTime: string; endTime: string }[] {
      return commonPeriods
        .filter(p => !excludeBreaks || !p.isBreak)
        .map(p => ({ periodNum: p.periodNumber, startTime: p.startTime, endTime: p.endTime }))
    }

    for (const item of pending) {
      if (item.remaining <= 0) continue
      const subject = item.subject
      const facultyId = subject.facultyId
      if (!facultyId) { unscheduled.push(subject); continue }

      const classroom = `CR-${subject.code.slice(-4)}`

      let placed = 0
      dayLoop: for (const day of workingDays) {
        const periodsForDay = getAvailablePeriodIndices(day)
        for (const periodInfo of periodsForDay) {
          if (placed >= item.remaining) break dayLoop
          if (!isPeriodAvailable(day, periodInfo.periodNum, facultyId, classroom, subject.id)) continue

          await prisma.timetable.create({
            data: {
              facultyId,
              departmentId: data.departmentId,
              courseId: data.courseId,
              subjectId: subject.id,
              className: data.className,
              section: data.section,
              dayOfWeek: day,
              periodNumber: periodInfo.periodNum,
              startTime: periodInfo.startTime,
              endTime: periodInfo.endTime,
              classroom,
              semester: data.semester,
            },
          })

          const fKey = slotKey(day, periodInfo.periodNum)
          occupiedFaculty.set(fKey, [...(occupiedFaculty.get(fKey) || []), facultyId])
          occupiedClassroom.set(fKey, [...(occupiedClassroom.get(fKey) || []), classroom])
          occupiedSection.set(fKey, [...(occupiedSection.get(fKey) || []), `${data.className}|${data.section}`])

          facultyLastPeriod.set(facultyId, { day, period: periodInfo.periodNum, subjectId: subject.id })

          generated.push({
            subject: subject.name,
            subjectCode: subject.code,
            day,
            period: periodInfo.periodNum,
            startTime: periodInfo.startTime,
            endTime: periodInfo.endTime,
            classroom,
            faculty: subject.faculty?.user?.name,
          })
          placed++
        }
      }

      if (placed < item.remaining) {
        unscheduled.push({ ...subject, unscheduledHours: item.remaining - placed })
      }
    }

    if (generated.length === 0) return { success: false, error: "Could not schedule any period. Check conflicts or available hours." }

    revalidatePath("/hod/timetable")
    revalidatePath("/faculty/timetable")
    revalidatePath("/student/timetable")

    return {
      success: true,
      data: {
        generated: generated.length,
        unscheduled: unscheduled.length,
        unscheduledSubjects: unscheduled.map((u) => ({ code: u.code, name: u.name, unscheduledHours: (u as any).unscheduledHours })),
        entries: generated,
      },
      message: `Generated ${generated.length} periods${unscheduled.length > 0 ? ` (${unscheduled.length} subjects unscheduled)` : ""}`,
    }
  } catch (error) {
    console.error("Error generating timetable:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to generate timetable" }
  }
}

export async function getHodTimetable(departmentId: string, filters?: { className?: string; section?: string; semester?: number; academicYear?: string }) {
  try {
    const where: any = { departmentId }
    if (filters?.className) where.className = filters.className
    if (filters?.section) where.section = filters.section
    if (filters?.semester) where.semester = filters.semester

    const timetable = await prisma.timetable.findMany({
      where,
      include: {
        faculty: { include: { user: { select: { name: true, email: true } } } },
        subject: true,
      },
      orderBy: { dayOfWeek: "asc" },
    })

    return { success: true, data: { timetable, classAssignments: [] } }
  } catch (error) {
    console.error("Error fetching timetable:", error)
    return { success: false, error: "Failed to fetch timetable" }
  }
}

export async function getTimetableConflicts(departmentId: string) {
  try {
    const all = await prisma.timetable.findMany({
      where: { departmentId },
      include: { faculty: { include: { user: { select: { name: true } } } }, subject: true },
      orderBy: { dayOfWeek: "asc" },
    })

    const facultyConflicts: any[] = []
    const classroomConflicts: any[] = []
    const facultyMap = new Map<string, any[]>()
    const classMap = new Map<string, any[]>()

    for (const t of all) {
      const fKey = `${t.facultyId}|${t.dayOfWeek}|${t.periodNumber}`
      const cKey = `${t.className}|${t.section}|${t.dayOfWeek}|${t.periodNumber}`
      if (!facultyMap.has(fKey)) facultyMap.set(fKey, [])
      if (!classMap.has(cKey)) classMap.set(cKey, [])
      facultyMap.get(fKey)!.push(t)
      classMap.get(cKey)!.push(t)
    }

    for (const [key, entries] of facultyMap) {
      if (entries.length > 1) facultyConflicts.push(...entries)
    }
    for (const [key, entries] of classMap) {
      if (entries.length > 1) classroomConflicts.push(...entries)
    }

    return { success: true, data: { facultyConflicts, classroomConflicts, totalConflicts: facultyConflicts.length + classroomConflicts.length } }
  } catch (error) {
    console.error("Error checking conflicts:", error)
    return { success: false, error: "Failed to check conflicts" }
  }
}

export async function getSubjectHoursForSemester(departmentId: string, semester: number) {
  try {
    const subjects = await prisma.subject.findMany({
      where: { departmentId, semester, isActive: true },
      include: { faculty: { include: { user: { select: { name: true } } } } },
      orderBy: { code: "asc" },
    })

    const withHours = subjects.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      credits: s.credits,
      totalHoursPerWeek: s.totalHoursPerWeek,
      facultyId: s.facultyId,
      facultyName: s.faculty?.user?.name || "Unassigned",
    }))

    const totalRequired = withHours.reduce((sum, s) => sum + (s.totalHoursPerWeek || Math.max(1, Math.ceil(s.credits))), 0)

    return { success: true, data: { subjects: withHours, totalRequiredHours: totalRequired } }
  } catch (error) {
    console.error("Error fetching subject hours:", error)
    return { success: false, error: "Failed to fetch subject hours" }
  }
}

export async function initDefaultPeriods(facultyUserId: string) {
  try {
    const session = await getSession()
    if (!session?.user || session.user.role !== "HOD") return { success: false, error: "Unauthorized" }

    const hod = await prisma.faculty.findUnique({
      where: { userId: facultyUserId },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }

    const count = await prisma.period.count()
    if (count > 0) return { success: false, error: "Periods already configured" }

    const defaultPeriods = [
      { periodNumber: 1, name: "Period 1", startTime: "09:00", endTime: "09:50", isBreak: false, displayOrder: 1 },
      { periodNumber: 2, name: "Period 2", startTime: "09:50", endTime: "10:40", isBreak: false, displayOrder: 2 },
      { periodNumber: 3, name: "Period 3", startTime: "10:40", endTime: "11:30", isBreak: false, displayOrder: 3 },
      { periodNumber: 4, name: "Short Break", startTime: "11:30", endTime: "11:45", isBreak: true, displayOrder: 4 },
      { periodNumber: 5, name: "Period 4", startTime: "11:45", endTime: "12:35", isBreak: false, displayOrder: 5 },
      { periodNumber: 6, name: "Lunch", startTime: "12:35", endTime: "13:30", isBreak: true, displayOrder: 6 },
      { periodNumber: 7, name: "Period 5", startTime: "13:30", endTime: "14:20", isBreak: false, displayOrder: 7 },
      { periodNumber: 8, name: "Period 6", startTime: "14:20", endTime: "15:10", isBreak: false, displayOrder: 8 },
    ]

    await prisma.period.createMany({ data: defaultPeriods })
    revalidatePath("/hod/timetable")
    return { success: true, message: "Default periods initialized" }
  } catch (error) {
    console.error("Error initializing periods:", error)
    return { success: false, error: "Failed to initialize periods" }
  }
}
