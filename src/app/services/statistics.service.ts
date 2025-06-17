import { Injectable } from '@angular/core';
import { TaskService } from './task.service';

export interface WeeklyStats {
  week: string;
  count: number;
}

export interface CategoryStats {
  categoryId: number | null;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  constructor(private taskService: TaskService) {}

  /** Get total number of tasks */
  getTotalTasks(): number {
    return this.taskService.currentTasks.length;
  }

  /**
   * Returns completed tasks grouped by ISO week.
   */
  getCompletedTasksPerWeek(): WeeklyStats[] {
    const completed = this.taskService.currentTasks.filter(t => t.completed && t.completed_at);
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
    const map = new Map<number | null, number>();
    this.taskService.currentTasks.forEach(task => {
      const key = task.category_id ?? null;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([categoryId, count]) => ({ categoryId, count }));
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