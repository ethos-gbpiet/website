'use client'

import { AttendanceConsole } from '@/components/attendance/attendance-console'

export default function SuperAdminAttendancePage() {
  return (
    <AttendanceConsole
      title="Attendance & Work Hours"
      subtitle="Mark attendance and track hours for every member and creator"
      memberLabel="Total Members"
      emptyStateHint="No members found."
    />
  )
}
