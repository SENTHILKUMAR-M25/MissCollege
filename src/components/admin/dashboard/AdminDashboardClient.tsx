"use client"

import { motion } from "framer-motion"
import {
  Users, GraduationCap, Building2, BookOpen, Library, Bell,
  TrendingUp, TrendingDown, ArrowRight, UserPlus, UserCheck,
  CalendarCheck, FileCheck, ClipboardEdit,
} from "lucide-react"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"

const PIE_COLORS = ["#111844", "#4B5694", "#7288AA", "#EAE0CF", "#5C7399", "#2F3C73"]

const activityIconMap: Record<string, React.ElementType> = {
  UserPlus, UserCheck, CalendarCheck, FileCheck, Bell, ClipboardEdit,
}

const quickActions = [
  { label: "Add Student", icon: UserPlus, color: "from-slate-600 to-slate-700", href: "/admin/students" },
  { label: "Add Faculty", icon: UserCheck, color: "from-slate-500 to-slate-600", href: "/admin/faculty" },
  { label: "Add Department", icon: Building2, color: "from-slate-700 to-slate-800", href: "/admin/departments" },
  { label: "Create Notice", icon: Bell, color: "from-slate-500 to-slate-600", href: "/admin/announcements" },
  { label: "Publish Result", icon: FileCheck, color: "from-slate-600 to-slate-800", href: "/admin/results" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

type Props = {
  stats: {
    totalStudents: number
    totalFaculty: number
    totalDepartments: number
    totalCourses: number
    totalSubjects: number
    activeNotices: number
    attendanceAvg: number
    passRate: number
    studentGrowth: number
    facultyGrowth: number
  }
  studentsByDept: { name: string; students: number }[]
  facultyByDept: { name: string; value: number }[]
  monthlyAttendance: { month: string; percentage: number }[]
  semesterPassRate: { semester: string; pass: number; fail: number }[]
  recentActivities: {
    id: string
    title: string
    description: string
    time: string
    user: string
    icon: string
  }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-white/10 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}{p.name === "percentage" ? "%" : ""}
        </p>
      ))}
    </div>
  )
}

export default function AdminDashboardClient({
  stats, studentsByDept, facultyByDept, monthlyAttendance, semesterPassRate, recentActivities,
}: Props) {
  const statCards = [
    { label: "Total Students", value: stats.totalStudents, growth: stats.studentGrowth, icon: GraduationCap, color: "from-slate-600 to-slate-700", bg: "bg-slate-500/20", iconColor: "text-slate-100" },
    { label: "Total Faculty", value: stats.totalFaculty, growth: stats.facultyGrowth, icon: UserCheck, color: "from-slate-500 to-slate-600", bg: "bg-slate-500/20", iconColor: "text-slate-100" },
    { label: "Departments", value: stats.totalDepartments, growth: 0, icon: Building2, color: "from-slate-700 to-slate-800", bg: "bg-slate-500/20", iconColor: "text-slate-100" },
    { label: "Total Courses", value: stats.totalCourses, growth: 5.0, icon: Library, color: "from-slate-500 to-slate-700", bg: "bg-slate-500/20", iconColor: "text-slate-100" },
    { label: "Total Subjects", value: stats.totalSubjects, growth: 2.4, icon: BookOpen, color: "from-slate-600 to-slate-800", bg: "bg-slate-500/20", iconColor: "text-slate-100" },
    { label: "Active Notices", value: stats.activeNotices, growth: -1.2, icon: Bell, color: "from-slate-500 to-slate-600", bg: "bg-slate-500/20", iconColor: "text-slate-100" },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          const isPositive = card.growth >= 0
          return (
            <motion.div key={card.label} variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-2xl bg-slate-800/50 border border-white/5 p-5 backdrop-blur-sm group cursor-pointer">
              <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${card.color} opacity-10 group-hover:opacity-20 transition-opacity blur-xl`} />
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon size={20} className={card.iconColor} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {Math.abs(card.growth)}%
                </div>
              </div>
              <p className="text-3xl font-black text-white mb-1">{formatNumber(card.value)}</p>
              <p className="text-slate-400 text-sm font-medium">{card.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Student Distribution Bar */}
        <motion.div variants={itemVariants} className="xl:col-span-2 rounded-2xl bg-slate-800/50 border border-white/5 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">Student Distribution</h3>
              <p className="text-slate-400 text-xs mt-0.5">By Department</p>
            </div>
            <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">Academic Year 2025-26</span>
          </div>
          {studentsByDept.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No student data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={studentsByDept} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="students" name="Students" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7288AA" />
                    <stop offset="100%" stopColor="#4B5694" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Faculty Distribution Pie */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 backdrop-blur-sm">
          <div className="mb-4">
            <h3 className="text-white font-semibold text-sm">Faculty Distribution</h3>
            <p className="text-slate-400 text-xs mt-0.5">By Department</p>
          </div>
          {facultyByDept.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-slate-500 text-sm">No faculty data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={facultyByDept} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {facultyByDept.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {facultyByDept.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                    <span className="truncate">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Monthly Attendance + Pass Rate */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <motion.div variants={itemVariants} className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">Monthly Attendance</h3>
              <p className="text-slate-400 text-xs mt-0.5">Average across all departments</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">{stats.attendanceAvg}%</p>
              <p className="text-xs text-emerald-400">Overall Average</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={monthlyAttendance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="percentage" name="percentage" stroke="#7288AA" strokeWidth={2.5}
                dot={{ fill: "#7288AA", r: 4, strokeWidth: 2, stroke: "#111844" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">Semester Pass Rate</h3>
              <p className="text-slate-400 text-xs mt-0.5">Pass vs Fail percentage</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">{stats.passRate}%</p>
              <p className="text-xs text-emerald-400">Overall Pass Rate</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={semesterPassRate} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="semester" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pass" name="Pass" fill="#7288AA" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="fail" name="Fail" fill="#4B5694" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="xl:col-span-2 rounded-2xl bg-slate-800/50 border border-white/5 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold text-sm">Recent Activities</h3>
              <p className="text-slate-400 text-xs mt-0.5">Latest system events</p>
            </div>
            <button className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">View all <ArrowRight size={12} /></button>
          </div>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No activity yet. Add students, faculty or notices to see activity here.</p>
            ) : recentActivities.map((act, idx) => {
              const Icon = activityIconMap[act.icon] ?? Bell
              const colors = ["text-slate-100 bg-slate-500/20", "text-slate-100 bg-slate-600/20", "text-slate-100 bg-slate-700/20"]
              return (
                <motion.div key={act.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }} className="flex gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colors[idx % colors.length]}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold">{act.title}</p>
                    <p className="text-slate-400 text-xs truncate">{act.description}</p>
                    <p className="text-slate-600 text-[10px] mt-0.5">{new Date(act.time).toLocaleDateString("en-IN")} · {act.user}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 backdrop-blur-sm">
          <div className="mb-5">
            <h3 className="text-white font-semibold text-sm">Quick Actions</h3>
            <p className="text-slate-400 text-xs mt-0.5">Common tasks</p>
          </div>
          <div className="space-y-2.5">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <motion.a key={action.label} href={action.href} whileHover={{ x: 4 }} transition={{ duration: 0.15 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group cursor-pointer">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                    <Icon size={15} className="text-white" />
                  </div>
                  <span className="text-slate-300 group-hover:text-white text-sm font-medium transition-colors flex-1">{action.label}</span>
                  <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                </motion.a>
              )
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
            {[
              { label: "Avg Attendance", value: `${stats.attendanceAvg}%`, color: "text-violet-400" },
              { label: "Pass Rate", value: `${stats.passRate}%`, color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
