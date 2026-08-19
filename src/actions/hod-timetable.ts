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

const DAYS = [1, 2, 3, 4, 5, 6]
const MAX_THEORY_CONSECUTIVE = 2
const MAX_LAB_CONSECUTIVE = 3
const MAX_SAME_SUBJECT_PER_DAY = 2  // theory; lab uses its own block logic

// ─── Slot key helper ──────────────────────────────────────────────────────
function slotKey(day: number, periodNum: number) { return `${day}|${periodNum}` }

// ─── Build a timetable entry object ──────────────────────────────────────
function buildEntry(data: any, subject: any, day: number, pNum: number, nonBreakPeriods: any[], classRoom: string, facultyId: string) {
  const period = nonBreakPeriods.find((p: any) => p.periodNumber === pNum)
  return {
    facultyId,
    departmentId: data.departmentId,
    subjectId: subject.id,
    className: data.className,
    section: data.section,
    dayOfWeek: day,
    periodNumber: pNum,
    classroom: classRoom,
    startTime: period?.startTime ?? "",
    endTime: period?.endTime ?? "",
    semester: data.semester,
    courseId: data.courseId || null,
    academicYear: data.academicYear,
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
  facultyUserId: string
  maxConsecutiveSameSubject?: number
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

    const workingDays = data.workingDays && data.workingDays.length > 0 ? data.workingDays : DAYS

    const [subjects, existingEntries, periods] = await Promise.all([
      prisma.subject.findMany({
        where: { departmentId: data.departmentId, semester: data.semester, isActive: true },
        include: { faculty: { include: { user: { select: { name: true } } } } },
      }),
      prisma.timetable.findMany({
        where: { departmentId: data.departmentId, className: data.className, section: data.section, semester: data.semester },
      }),
      prisma.period.findMany({ orderBy: { displayOrder: "asc" } }),
    ])

    if (subjects.length === 0) return { success: false, error: "No subjects found for this semester" }
    if (periods.length === 0) return { success: false, error: "No periods configured. Initialize periods first." }

    const nonBreakPeriods = periods.filter(p => !p.isBreak).sort((a, b) => a.displayOrder - b.displayOrder)
    const periodOrder = new Map(periods.map(p => [p.periodNumber, p.displayOrder]))
    const totalSlotsPerWeek = workingDays.length * nonBreakPeriods.length

    // ── Slot occupancy maps ──────────────────────────────────────────────
    // key: "day|periodNum"
    const occupiedFaculty  = new Map<string, string>()   // slot → facultyId
    const occupiedSection  = new Map<string, string>()   // slot → "className|section"
    const slotSubject      = new Map<string, string>()   // slot → subjectId (for this section)

    for (const t of existingEntries) {
      const k = slotKey(t.dayOfWeek, t.periodNumber ?? 0)
      occupiedFaculty.set(k, t.facultyId)
      occupiedSection.set(k, `${t.className}|${t.section}`)
      slotSubject.set(k, t.subjectId ?? "")
    }

    const classroom = (code: string) => `CR-${code.slice(-4).toUpperCase()}`

    // ── Build target hours per subject ──────────────────────────────────
    const targetHours: Record<string, number> = {}
    for (const s of subjects) {
      const raw = s.totalHoursPerWeek ?? Math.max(1, Math.ceil(s.credits))
      // Never request more slots than exist
      targetHours[s.id] = Math.min(raw, totalSlotsPerWeek)
    }

    // ── Sort queue: labs first, then by required hours desc ─────────────
    const queue = subjects
      .filter(s => targetHours[s.id] > 0)
      .map(s => ({ subject: s, remaining: targetHours[s.id], isLab: (s.subjectType ?? "") === "LAB" }))
      .sort((a, b) => {
        if (a.isLab !== b.isLab) return a.isLab ? -1 : 1
        return b.remaining - a.remaining
      })

    const toInsert: any[] = []
    const unscheduled: string[] = []

    for (const item of queue) {
      const subject = item.subject
      const facultyId = subject.facultyId
      if (!facultyId) { unscheduled.push(subject.name); continue }

      const classRoom = classroom(subject.code)
      const isLab = item.isLab
      let remaining = item.remaining

      if (isLab) {
        // ── LAB: place as block(s) of up to 3 consecutive periods ────────
        // Try block sizes from MAX down to 1
        for (const { day } of getOrderedDays(workingDays, subject.id, toInsert)) {
          if (remaining <= 0) break
          const blockSize = Math.min(remaining, MAX_LAB_CONSECUTIVE)

          // Try to find a consecutive block of `blockSize` on this day
          let placed = tryPlaceBlock(day, blockSize, nonBreakPeriods, periodOrder,
            facultyId, classRoom, data.className, data.section, subject.id,
            occupiedFaculty, occupiedSection, slotSubject, toInsert, data, subject)

          // If full block not possible, try smaller blocks
          if (placed === 0 && blockSize > 1) {
            placed = tryPlaceBlock(day, blockSize - 1, nonBreakPeriods, periodOrder,
              facultyId, classRoom, data.className, data.section, subject.id,
              occupiedFaculty, occupiedSection, slotSubject, toInsert, data, subject)
          }
          if (placed === 0 && blockSize > 2) {
            placed = tryPlaceBlock(day, 1, nonBreakPeriods, periodOrder,
              facultyId, classRoom, data.className, data.section, subject.id,
              occupiedFaculty, occupiedSection, slotSubject, toInsert, data, subject)
          }
          remaining -= placed
        }
      } else {
        // ── THEORY: spread across days, max 2 consecutive per day ────────
        // Calculate ideal spread: how many periods per day
        const periodsPerDay = Math.ceil(remaining / workingDays.length)
        const maxPerDay = Math.min(periodsPerDay, MAX_THEORY_CONSECUTIVE)

        for (const { day } of getOrderedDays(workingDays, subject.id, toInsert)) {
          if (remaining <= 0) break

          // Count how many already placed today for this subject
          const todayCount = toInsert.filter(e => e.subjectId === subject.id && e.dayOfWeek === day).length
          if (todayCount >= maxPerDay) continue

          const canPlace = Math.min(remaining, maxPerDay - todayCount)
          const placed = placeTheory(day, canPlace, nonBreakPeriods, periodOrder,
            facultyId, classRoom, data.className, data.section, subject.id,
            occupiedFaculty, occupiedSection, slotSubject, toInsert, data, subject)
          remaining -= placed
        }

        // Second pass: if still remaining, try any available slot without day limit
        if (remaining > 0) {
          for (const { day } of getOrderedDays(workingDays, subject.id, toInsert)) {
            if (remaining <= 0) break
            const todayCount = toInsert.filter(e => e.subjectId === subject.id && e.dayOfWeek === day).length
            if (todayCount >= MAX_THEORY_CONSECUTIVE) continue  // hard limit still applies
            const canPlace = Math.min(remaining, MAX_THEORY_CONSECUTIVE - todayCount)
            const placed = placeTheory(day, canPlace, nonBreakPeriods, periodOrder,
              facultyId, classRoom, data.className, data.section, subject.id,
              occupiedFaculty, occupiedSection, slotSubject, toInsert, data, subject)
            remaining -= placed
          }
        }
      }

      if (remaining > 0) {
        unscheduled.push(`${subject.name} (${remaining} hrs unscheduled)`)
      }
    }

    if (toInsert.length === 0) {
      return { success: false, error: "Could not schedule any period. Ensure subjects have faculty assigned and periods are configured." }
    }

    // ── Batch insert ─────────────────────────────────────────────────────
    await prisma.timetable.createMany({ data: toInsert, skipDuplicates: true })

    revalidatePath("/hod/timetable")
    revalidatePath("/faculty/timetable")
    revalidatePath("/student/timetable")

    const msg = unscheduled.length > 0
      ? `Generated ${toInsert.length} periods. Could not fully schedule: ${unscheduled.join(", ")}`
      : `Generated ${toInsert.length} periods. All subjects scheduled ✓`

    return {
      success: true,
      data: { generated: toInsert.length, unscheduled: unscheduled.length, unscheduledSubjects: unscheduled },
      message: msg,
    }
  } catch (error) {
    console.error("Error generating timetable:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to generate timetable" }
  }
}

// ─── Get days ordered by least usage for this subject (for spreading) ─────
function getOrderedDays(
  workingDays: number[],
  subjectId: string,
  pending: any[]
): { day: number }[] {
  return workingDays
    .map(day => ({ day, count: pending.filter(e => e.subjectId === subjectId && e.dayOfWeek === day).length }))
    .sort((a, b) => a.count - b.count)
}

// ─── Try to place a consecutive block for lab subjects ────────────────────
function tryPlaceBlock(
  day: number, size: number,
  nonBreakPeriods: any[], periodOrder: Map<number, number>,
  facultyId: string, classRoom: string, className: string, section: string, subjectId: string,
  occupiedFaculty: Map<string, string>, occupiedSection: Map<string, string>,
  slotSubject: Map<string, string>, pending: any[],
  data: any, subject: any
): number {
  const sorted = [...nonBreakPeriods].sort((a, b) => a.displayOrder - b.displayOrder)

  for (let start = 0; start <= sorted.length - size; start++) {
    const block: number[] = []
    for (let j = start; j < start + size; j++) {
      const p = sorted[j]
      // Must be consecutive in display order (no break in between)
      if (j > start) {
        const prevOrder = periodOrder.get(sorted[j - 1].periodNumber) ?? 0
        const curOrder = periodOrder.get(p.periodNumber) ?? 0
        if (curOrder - prevOrder !== 1) break
      }
      if (!isSlotFree(day, p.periodNumber, facultyId, classRoom, className, section, occupiedFaculty, occupiedSection, pending)) break
      block.push(p.periodNumber)
    }
    if (block.length === size) {
      // Place the block
      for (const pNum of block) {
        markSlot(day, pNum, facultyId, classRoom, className, section, subjectId, occupiedFaculty, occupiedSection, slotSubject)
        pending.push(buildEntry(data, subject, day, pNum, nonBreakPeriods, classRoom, facultyId))
      }
      return size
    }
  }
  return 0
}

// ─── Place theory periods (respecting max 2 consecutive) ─────────────────
function placeTheory(
  day: number, count: number,
  nonBreakPeriods: any[], periodOrder: Map<number, number>,
  facultyId: string, classRoom: string, className: string, section: string, subjectId: string,
  occupiedFaculty: Map<string, string>, occupiedSection: Map<string, string>,
  slotSubject: Map<string, string>, pending: any[],
  data: any, subject: any
): number {
  const sorted = [...nonBreakPeriods].sort((a, b) => a.displayOrder - b.displayOrder)
  let placed = 0
  let lastOrder = -999
  let consecutive = 0

  for (const period of sorted) {
    if (placed >= count) break
    const pNum = period.periodNumber
    const pOrder = periodOrder.get(pNum) ?? 0

    if (!isSlotFree(day, pNum, facultyId, classRoom, className, section, occupiedFaculty, occupiedSection, pending)) continue

    // Track consecutive for this subject on this day
    const isAdjacent = pOrder - lastOrder === 1
    // Check what's in the previous slot — only count as consecutive if same subject
    const prevKey = slotKey(day, sorted.find(p => (periodOrder.get(p.periodNumber) ?? 0) === pOrder - 1)?.periodNumber ?? -1)
    const prevIsSame = pending.some(e => e.dayOfWeek === day && e.periodNumber === sorted.find(p => (periodOrder.get(p.periodNumber) ?? 0) === pOrder - 1)?.periodNumber && e.subjectId === subjectId)

    if (isAdjacent && prevIsSame) {
      consecutive++
    } else {
      consecutive = 1
    }

    // Hard limit: max 2 consecutive for theory
    if (consecutive > MAX_THEORY_CONSECUTIVE) continue

    markSlot(day, pNum, facultyId, classRoom, className, section, subjectId, occupiedFaculty, occupiedSection, slotSubject)
    pending.push(buildEntry(data, subject, day, pNum, nonBreakPeriods, classRoom, facultyId))
    lastOrder = pOrder
    placed++
  }
  return placed
}

// ─── Check if a slot is free ──────────────────────────────────────────────
function isSlotFree(
  day: number, pNum: number,
  facultyId: string, classRoom: string, className: string, section: string,
  occupiedFaculty: Map<string, string>,
  occupiedSection: Map<string, string>,
  pending: any[]
): boolean {
  const k = slotKey(day, pNum)
  // Check DB-existing occupancy
  if (occupiedFaculty.has(k)) return false           // faculty busy
  if (occupiedSection.get(k) === `${className}|${section}`) return false  // section busy
  // Check pending inserts
  return !pending.some(e =>
    e.dayOfWeek === day && e.periodNumber === pNum &&
    (e.facultyId === facultyId || (e.className === className && e.section === section))
  )
}

// ─── Mark a slot as occupied ──────────────────────────────────────────────
function markSlot(
  day: number, pNum: number,
  facultyId: string, classRoom: string, className: string, section: string, subjectId: string,
  occupiedFaculty: Map<string, string>,
  occupiedSection: Map<string, string>,
  slotSubject: Map<string, string>
) {
  const k = slotKey(day, pNum)
  occupiedFaculty.set(k, facultyId)
  occupiedSection.set(k, `${className}|${section}`)
  slotSubject.set(k, subjectId)
}

export async function getHodTimetable(departmentId: string, filters?: { className?: string; section?: string; semester?: number }) {
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


