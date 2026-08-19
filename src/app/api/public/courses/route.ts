import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

function deriveDefaults(code, department) {
  const prefix = (code || "").split("-")[0]?.toUpperCase() || ""
  const dept = (department || "").toLowerCase()
  const publicTypeMap = {
    BSC: "Undergraduate", BCOM: "Undergraduate", BA: "Undergraduate",
    BBA: "Undergraduate", BSW: "Undergraduate", MSC: "Postgraduate", MBA: "Postgraduate",
  }
  return {
    type: publicTypeMap[prefix] || (dept.includes("management") ? "Postgraduate" : "Undergraduate"),
    mode: "Full-Time",
    degree: "",
    color: "from-primary-blue to-secondary-emerald",
    icon: "🎓",
  }
}

export async function GET() {
  try {
    const rows = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
    })
    const courses = rows.map((c) => {
      const defaults = deriveDefaults(c.code, c.department?.name ?? null)
      return {
        id: c.id,
        slug: c.slug || (c.code || "").toLowerCase() || c.id,
        name: c.name,
        code: c.code,
        degree: c.name,
        department: c.department?.name || "General",
        duration: c.duration || "3 Years",
        type: c.type || defaults.type,
        mode: c.mode || defaults.mode,
        seats: c.seats ?? 60,
        fee: c.fee || "₹40,000 / year",
        eligibility: c.eligibility || "See admission criteria",
        affiliation: c.affiliation || "Madurai Kamaraj University",
        accreditation: c.accreditation || "NAAC Grade A",
        overview: c.overview || `${c.name} program at MISS College.`,
        bgImage: c.bgImage || "",
        highlights: Array.isArray(c.highlights) && c.highlights.length > 0 ? c.highlights : ["Quality Education", "Experienced Faculty", "Modern Infrastructure", "Placement Assistance"],
        curriculum: Array.isArray(c.curriculum) ? c.curriculum : [],
        faculty: Array.isArray(c.faculty) ? c.faculty : [],
        careerProspects: Array.isArray(c.careerProspects) && c.careerProspects.length > 0 ? c.careerProspects : ["Career growth in the chosen field"],
        topRecruiters: Array.isArray(c.topRecruiters) && c.topRecruiters.length > 0 ? c.topRecruiters : [],
        color: c.color || defaults.color,
        icon: c.icon || defaults.icon,
      }
    })
    return NextResponse.json({ courses })
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}
