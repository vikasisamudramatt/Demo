import { Component } from '@angular/core';
import { ReviewService, ReviewItem } from './review.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pr-review-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2>PR Review Demo</h2>
      <form (ngSubmit)="add()" aria-label="Add review suggestion">
        <label>
          Title
          <input [(ngModel)]="title" name="title" />
        </label>
        <label>
          Description
          <input [(ngModel)]="description" name="description" />
        </label>
        <button type="submit" class="btn btn-primary">Add</button>
      </form>

      <div class="card" *ngFor="let r of reviews">
        <h3>{{ r.title }}</h3>
        <p>{{ r.description }}</p>
        <select [(ngModel)]="r.status" name="status-{{r.id}}">
          <option value="open">open</option>
          <option value="accepted">accepted</option>
          <option value="rejected">rejected</option>
        </select>
        <button class="btn btn-secondary" (click)="remove(r.id)">Remove</button>
      </div>
    </div>
  `,
})
export class PrReviewDemoComponent {
  title = '';
  description = '';
  reviews: ReviewItem[] = [];

  constructor(private svc: ReviewService) {
    this.load();
  }

  async load() {
    this.reviews = await this.svc.list();
  }
  async add() {
    if (!this.title || !this.description) return;
    await this.svc.add({ title: this.title, description: this.description });
    this.title = '';
    this.description = '';
    await this.load();
  }
  async remove(id: number) {
    await this.svc.remove(id);
    await this.load();
  }
}
