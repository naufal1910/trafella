// Shared types for Planner time editing
export interface ActivityItem {
  id: string
  name: string
  startTime: string // HH:MM
  endTime: string   // HH:MM
  description: string
  location: string
}
