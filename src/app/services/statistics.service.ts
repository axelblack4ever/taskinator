import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Task } from '../models/task.model';

export interface WeeklyStats {
  week: string;
  count: number;
}

export interface CategoryStats {
  name: string | null;
  pending: number;
  historical: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private tasks: Task[] = [];

  constructor(private supabase: SupabaseService) {}

  async loadData(): Promise<void> {
    this.tasks = await this.supabase.getAll('tasks');
  }

  /** Historical total */
  getTotalTasks(): number {
    return this.tasks.length;
  }

  /** Pending tasks total */
  getPendingTotal(): number {
    return this.tasks.filter(t => !t.completed).length;
  }

  /** Completed tasks total */
  getCompletedTotal(): number {
    return this.tasks.filter(t => t.completed).length;
  }

  /**
   * Returns completed tasks grouped by ISO week.
   */
  getCompletedTasksPerWeek(): WeeklyStats[] {
    const completed = this.tasks.filter(t => t.completed && t.completed_at);
    const map = new Map<string, number>();
    completed.forEach(task => {
      if (task.completed_at) {
        const week = this.getYearWeek(task.completed_at);
        map.set(week, (map.get(week) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([week, count]) => ({ week, count }));
  }

  /**
   * Returns task counts grouped by category.
   */
  getCountsPerCategory(): CategoryStats[] {
    const map = new Map<string | null, { pending: number; historical: number }>();
    this.tasks.forEach(task => {
      const name = (task as any).category_name ?? null;
      const entry = map.get(name) || { pending: 0, historical: 0 };
      entry.historical += 1;
      if (!task.completed) {
        entry.pending += 1;
      }
      map.set(name, entry);
    });
    return Array.from(map.entries()).map(([name, counts]) => ({ name, ...counts }));
  }

  private getYearWeek(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week}`;
  }

  // ISO week number
  private getWeekNumber(date: Date): number {
    const thursday = new Date(date.getTime());
    thursday.setDate(thursday.getDate() + 3 - ((thursday.getDay() + 6) % 7));
    const firstThursday = new Date(thursday.getFullYear(), 0, 4);
    const diff = thursday.getTime() - firstThursday.getTime();
    return 1 + Math.round(diff / 604800000); // 604800000 ms per week
  }
}