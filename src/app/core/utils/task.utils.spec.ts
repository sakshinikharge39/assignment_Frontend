import { Task } from '../models/task.model';
import {
  formatDisplayDate,
  formatToLocalISODate,
  getDaysOverdue,
  getNextStatus,
  isOverdue
} from './task.utils';

describe('Task Pure Utilities', () => {
  const TODAY = '2026-11-23';

  describe('isOverdue', () => {
    it('should return true when task status is Todo and dueDate is before today', () => {
      const task: Pick<Task, 'status' | 'dueDate'> = {
        status: 'Todo',
        dueDate: '2026-11-20'
      };
      expect(isOverdue(task, TODAY)).toBeTrue();
    });

    it('should return true when task status is In Progress and dueDate is before today', () => {
      const task: Pick<Task, 'status' | 'dueDate'> = {
        status: 'In Progress',
        dueDate: '2026-11-22'
      };
      expect(isOverdue(task, TODAY)).toBeTrue();
    });

    it('should return false when task status is Done even if dueDate is before today', () => {
      const task: Pick<Task, 'status' | 'dueDate'> = {
        status: 'Done',
        dueDate: '2026-11-15'
      };
      expect(isOverdue(task, TODAY)).toBeFalse();
    });

    it('should return false when dueDate is exactly today', () => {
      const task: Pick<Task, 'status' | 'dueDate'> = {
        status: 'Todo',
        dueDate: TODAY
      };
      expect(isOverdue(task, TODAY)).toBeFalse();
    });

    it('should return false when dueDate is in the future', () => {
      const task: Pick<Task, 'status' | 'dueDate'> = {
        status: 'Todo',
        dueDate: '2026-11-25'
      };
      expect(isOverdue(task, TODAY)).toBeFalse();
    });

    it('should return false when dueDate is undefined or empty', () => {
      const task: Pick<Task, 'status' | 'dueDate'> = {
        status: 'Todo',
        dueDate: undefined
      };
      expect(isOverdue(task, TODAY)).toBeFalse();
    });
  });

  describe('getNextStatus', () => {
    it('should transition Todo -> In Progress', () => {
      expect(getNextStatus('Todo')).toBe('In Progress');
    });

    it('should transition In Progress -> Done', () => {
      expect(getNextStatus('In Progress')).toBe('Done');
    });

    it('should reopen Done -> Todo', () => {
      expect(getNextStatus('Done')).toBe('Todo');
    });
  });

  describe('formatToLocalISODate', () => {
    it('should format a date into YYYY-MM-DD local string', () => {
      const date = new Date(2026, 10, 23); // month is 0-indexed (10 is Nov)
      expect(formatToLocalISODate(date)).toBe('2026-11-23');
    });
  });

  describe('getDaysOverdue', () => {
    it('should return correct number of overdue days', () => {
      expect(getDaysOverdue('2026-11-20', TODAY)).toBe(3);
    });

    it('should return 0 when dueDate is today or in future', () => {
      expect(getDaysOverdue('2026-11-23', TODAY)).toBe(0);
      expect(getDaysOverdue('2026-11-25', TODAY)).toBe(0);
    });
  });

  describe('formatDisplayDate', () => {
    it('should return friendly formatted string', () => {
      const formatted = formatDisplayDate('2026-11-23');
      expect(formatted).toContain('Nov');
      expect(formatted).toContain('23');
      expect(formatted).toContain('2026');
    });

    it('should return "No due date" when undefined', () => {
      expect(formatDisplayDate(undefined)).toBe('No due date');
    });
  });
});
