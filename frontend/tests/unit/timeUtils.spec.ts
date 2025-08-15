import { describe, it, expect } from 'vitest'
import { validateTimes, reflowTimes } from '@/utils/timeUtils'
import type { ActivityItem } from '@/types/planner'

describe('timeUtils', () => {
  const mockItems: ActivityItem[] = [
    {
      id: '1',
      name: 'Morning Activity',
      startTime: '09:00',
      endTime: '10:30',
      description: 'Test activity 1',
      location: 'Location 1'
    },
    {
      id: '2', 
      name: 'Afternoon Activity',
      startTime: '11:00',
      endTime: '12:30',
      description: 'Test activity 2',
      location: 'Location 2'
    },
    {
      id: '3',
      name: 'Evening Activity', 
      startTime: '14:00',
      endTime: '16:00',
      description: 'Test activity 3',
      location: 'Location 3'
    }
  ]

  describe('validateTimes', () => {
    it('should return valid for non-overlapping times', () => {
      const result = validateTimes(mockItems)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should detect overlapping activities', () => {
      const overlappingItems: ActivityItem[] = [
        {
          id: '1',
          name: 'Activity 1',
          startTime: '09:00',
          endTime: '11:00',
          description: 'Test',
          location: 'Location 1'
        },
        {
          id: '2',
          name: 'Activity 2', 
          startTime: '10:30',
          endTime: '12:00',
          description: 'Test',
          location: 'Location 2'
        }
      ]

      const result = validateTimes(overlappingItems)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Activities "Activity 1" and "Activity 2" have overlapping times')
    })

    it('should detect invalid time format', () => {
      const invalidItems: ActivityItem[] = [
        {
          id: '1',
          name: 'Activity 1',
          startTime: '25:00', // Invalid hour
          endTime: '10:00',
          description: 'Test',
          location: 'Location 1'
        }
      ]

      const result = validateTimes(invalidItems)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid time format for "Activity 1": 25:00')
    })

    it('should detect end time before start time', () => {
      const invalidItems: ActivityItem[] = [
        {
          id: '1',
          name: 'Activity 1',
          startTime: '12:00',
          endTime: '10:00', // Before start time
          description: 'Test',
          location: 'Location 1'
        }
      ]

      const result = validateTimes(invalidItems)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('End time cannot be before start time for "Activity 1"')
    })

    it('should detect times outside day bounds (before 6:00)', () => {
      const earlyItems: ActivityItem[] = [
        {
          id: '1',
          name: 'Early Activity',
          startTime: '05:00',
          endTime: '07:00',
          description: 'Test',
          location: 'Location 1'
        }
      ]

      const result = validateTimes(earlyItems)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Activity "Early Activity" starts before 6:00 AM')
    })

    it('should detect times outside day bounds (after 23:00)', () => {
      const lateItems: ActivityItem[] = [
        {
          id: '1',
          name: 'Late Activity',
          startTime: '22:00',
          endTime: '23:30',
          description: 'Test',
          location: 'Location 1'
        }
      ]

      const result = validateTimes(lateItems)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Activity "Late Activity" ends after 11:00 PM')
    })
  })

  describe('reflowTimes', () => {
    it('should reflow times when an activity is extended', () => {
      const editedActivity = {
        id: '1',
        name: 'Morning Activity',
        startTime: '09:00',
        endTime: '11:30', // Extended by 1 hour
        description: 'Test activity 1',
        location: 'Location 1'
      }

      const result = reflowTimes(mockItems, editedActivity)
      
      // First activity should be updated
      expect(result[0].endTime).toBe('11:30')
      
      // Second activity should be pushed later
      expect(result[1].startTime).toBe('11:30')
      expect(result[1].endTime).toBe('13:00')
      
      // Third activity should also be pushed
      expect(result[2].startTime).toBe('13:00')
      expect(result[2].endTime).toBe('15:00')
    })

    it('should reflow times when an activity is shortened', () => {
      const editedActivity = {
        id: '1',
        name: 'Morning Activity',
        startTime: '09:00',
        endTime: '10:00', // Shortened by 30 minutes
        description: 'Test activity 1',
        location: 'Location 1'
      }

      const result = reflowTimes(mockItems, editedActivity)
      
      // First activity should be updated
      expect(result[0].endTime).toBe('10:00')
      
      // Second activity should start earlier
      expect(result[1].startTime).toBe('10:00')
      expect(result[1].endTime).toBe('11:30')
      
      // Third activity timing should remain the same since there's a gap
      expect(result[2].startTime).toBe('14:00')
      expect(result[2].endTime).toBe('16:00')
    })

    it('should handle start time changes', () => {
      const editedActivity = {
        id: '2',
        name: 'Afternoon Activity',
        startTime: '10:00', // Moved earlier
        endTime: '12:30',
        description: 'Test activity 2',
        location: 'Location 2'
      }

      const result = reflowTimes(mockItems, editedActivity)
      
      // First activity should end before the edited one starts
      expect(result[0].endTime).toBe('10:00')
      
      // Edited activity should have new times
      expect(result[1].startTime).toBe('10:00')
      expect(result[1].endTime).toBe('12:30')
    })

    it('should cap activities at day end (23:00)', () => {
      const lateItems: ActivityItem[] = [
        {
          id: '1',
          name: 'Late Activity 1',
          startTime: '21:00',
          endTime: '22:00',
          description: 'Test',
          location: 'Location 1'
        },
        {
          id: '2',
          name: 'Late Activity 2',
          startTime: '22:00',
          endTime: '23:00',
          description: 'Test',
          location: 'Location 2'
        }
      ]

      const editedActivity = {
        id: '1',
        name: 'Late Activity 1',
        startTime: '21:00',
        endTime: '23:00', // Extended to push next activity past day end
        description: 'Test',
        location: 'Location 1'
      }

      const result = reflowTimes(lateItems, editedActivity)
      
      // First activity should be capped at 22:00 to allow second activity
      expect(result[0].endTime).toBe('22:00')
      
      // Second activity should be capped at day end
      expect(result[1].startTime).toBe('22:00')
      expect(result[1].endTime).toBe('23:00')
    })

    it('should return original items if edited activity not found', () => {
      const nonExistentActivity = {
        id: 'nonexistent',
        name: 'Non-existent',
        startTime: '09:00',
        endTime: '10:00',
        description: 'Test',
        location: 'Location'
      }

      const result = reflowTimes(mockItems, nonExistentActivity)
      expect(result).toEqual(mockItems)
    })
  })
})
