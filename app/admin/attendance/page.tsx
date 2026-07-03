'use client'

import { AttendanceConsole } from '@/components/attendance/attendance-console'

export default function AdminAttendancePage() {
  return (
    <AttendanceConsole
      title="Attendance & Work Hours"
      subtitle="Mark attendance and track hours for your assigned apprentices"
      memberLabel="My Apprentices"
      emptyStateHint="You have no apprentices assigned yet. Ask a super admin to assign members or creators to you."
    />
  )
}
