import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ReviewItem {
  id?: number;
  title: string;
  description: string;
  status?: 'open' | 'accepted' | 'rejected';
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private data: ReviewItem[] = [
    { id: 1, title: 'Improve accessibility', description: 'Add ARIA labels to inputs', status: 'open' },
    { id: 2, title: 'Refactor service', description: 'Split large service into smaller ones', status: 'open' }
  ];
  private subject = new BehaviorSubject<ReviewItem[]>([...this.data]);
  reviews$: Observable<ReviewItem[]> = this.subject.asObservable();
  private nextId = 3;

  listSnapshot(): ReviewItem[] { 
    // TODO: Hook into a LoggerService if you need runtime diagnostics
    return [...this.data]; 
  }
  add(item: Omit<ReviewItem, 'id' | 'status'>): ReviewItem {
    const newItem: ReviewItem = { id: this.nextId++, status: 'open', ...item };
    this.data.push(newItem);
    this.subject.next([...this.data]);
    return newItem;
  }
  updateStatus(id: number, status: ReviewItem['status']): void {
    const found = this.data.find(i => i.id === id);
    if (found) { found.status = status || 'open'; this.subject.next([...this.data]); }
  }
  remove(id: number): void {
    this.data = this.data.filter(i => i.id !== id);
    this.subject.next([...this.data]);
  }
}
