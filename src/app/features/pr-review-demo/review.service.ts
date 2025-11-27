import { Injectable } from '@angular/core';

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
  private nextId = 3;

  async list(): Promise<ReviewItem[]> {
    // simulate async
    return Promise.resolve(this.data.map(x => ({ ...x })));
  }
  async add(item: Omit<ReviewItem, 'id'>): Promise<ReviewItem> {
    const newItem: ReviewItem = { id: this.nextId++, status: 'open', ...item };
    this.data.push(newItem);
    return Promise.resolve({ ...newItem });
  }
  async remove(id: number): Promise<void> {
    this.data = this.data.filter(i => i.id !== id);
    return Promise.resolve();
  }
}
