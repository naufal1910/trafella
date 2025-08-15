import type { ActivityItem } from '@/types/planner'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validates that all activities have valid times with no overlaps and within day bounds (6:00-23:00)
 */
export function validateTimes(items: ActivityItem[]): ValidationResult {
  const errors: string[] = []

  for (const item of items) {
    // Validate time format
    if (!isValidTimeFormat(item.startTime)) {
      errors.push(`Invalid time format for "${item.name}": ${item.startTime}`)
    }
    if (!isValidTimeFormat(item.endTime)) {
      errors.push(`Invalid time format for "${item.name}": ${item.endTime}`)
    }

    // Skip further validation if format is invalid
    if (!isValidTimeFormat(item.startTime) || !isValidTimeFormat(item.endTime)) {
      continue
    }

    // Validate start time is before end time
    if (timeToMinutes(item.startTime) >= timeToMinutes(item.endTime)) {
      errors.push(`End time cannot be before start time for "${item.name}"`)
    }

    // Validate within day bounds (6:00 AM to 11:00 PM)
    const startMinutes = timeToMinutes(item.startTime)
    const endMinutes = timeToMinutes(item.endTime)
    const dayStart = 6 * 60 // 6:00 AM
    const dayEnd = 23 * 60 // 11:00 PM

    if (startMinutes < dayStart) {
      errors.push(`Activity "${item.name}" starts before 6:00 AM`)
    }
    if (endMinutes > dayEnd) {
      errors.push(`Activity "${item.name}" ends after 11:00 PM`)
    }
  }

  // Check for overlaps
  const sortedItems = [...items]
    .filter(item => isValidTimeFormat(item.startTime) && isValidTimeFormat(item.endTime))
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

  for (let i = 0; i < sortedItems.length - 1; i++) {
    const current = sortedItems[i]
    const next = sortedItems[i + 1]
    
    const currentEnd = timeToMinutes(current.endTime)
    const nextStart = timeToMinutes(next.startTime)
    
    if (currentEnd > nextStart) {
      errors.push(`Activities "${current.name}" and "${next.name}" have overlapping times`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Reflows times when an activity is edited, pushing subsequent activities to maintain no overlaps
 * and keeping all activities within day bounds (6:00-23:00)
 */
export function reflowTimes(items: ActivityItem[], editedActivity: ActivityItem): ActivityItem[] {
  const DAY_END = 23 * 60
  const editedIndex = items.findIndex(item => item.id === editedActivity.id)
  if (editedIndex === -1) {
    return items // Return original if edited activity not found
  }

  // Preserve originals for duration reference
  const original = items.map(i => ({ ...i }))
  const result = items.map(i => ({ ...i }))

  // Apply edit
  result[editedIndex] = { ...editedActivity }

  // If the edited activity starts earlier than the previous ends, shorten the previous
  if (editedIndex > 0) {
    const prev = result[editedIndex - 1]
    if (timeToMinutes(prev.endTime) > timeToMinutes(result[editedIndex].startTime)) {
      result[editedIndex - 1] = {
        ...prev,
        endTime: result[editedIndex].startTime,
      }
    }
  }

  // Determine change type on edited activity (based on end time)
  const origEdited = original[editedIndex]
  const extended = timeToMinutes(result[editedIndex].endTime) > timeToMinutes(origEdited.endTime)
  const shortened = timeToMinutes(result[editedIndex].endTime) < timeToMinutes(origEdited.endTime)

  const origDurations = original.map(
    (i) => timeToMinutes(i.endTime) - timeToMinutes(i.startTime)
  )

  // Forward reflow rules based on tests/spec expectations
  if (extended) {
    // Make the remainder of the day contiguous, preserving original durations
    for (let i = editedIndex + 1; i < result.length; i++) {
      const prev = result[i - 1]
      const duration = origDurations[i]
      let startMin = timeToMinutes(prev.endTime)
      let endMin = startMin + duration

      if (endMin > DAY_END) {
        // Prefer keeping later activity duration by shrinking previous end
        const neededStart = DAY_END - duration
        if (i - 1 >= 0) {
          // shrink previous end to allow current to fit fully
          result[i - 1] = { ...prev, endTime: minutesToTime(neededStart) }
          startMin = neededStart
          endMin = DAY_END
        } else {
          // No previous (edge), just cap current
          endMin = DAY_END
          startMin = Math.max(endMin - duration, startMin)
        }
      }

      result[i] = {
        ...result[i],
        startTime: minutesToTime(startMin),
        endTime: minutesToTime(endMin),
      }
    }
  } else if (shortened) {
    // Only pull the immediate next activity earlier to close the gap, keep others as-is
    const i = editedIndex + 1
    if (i < result.length) {
      const duration = origDurations[i]
      let startMin = timeToMinutes(result[i - 1].endTime)
      let endMin = startMin + duration
      if (endMin > DAY_END) {
        const neededStart = DAY_END - duration
        result[i - 1] = { ...result[i - 1], endTime: minutesToTime(neededStart) }
        startMin = neededStart
        endMin = DAY_END
      }
      result[i] = {
        ...result[i],
        startTime: minutesToTime(startMin),
        endTime: minutesToTime(endMin),
      }
    }
  } else {
    // Start-time-only changes already handled by adjusting the previous item.
  }

  return result
}

/**
 * Validates time format (HH:MM)
 */
function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

/**
 * Converts time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Converts minutes since midnight to time string (HH:MM)
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}
