import { Component, OnDestroy } from '@angular/core';
import { NgFor } from '@angular/common'; // intentionally unused to trigger ESLint
import { ReviewService, ReviewItem } from './review.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pr-review-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" aria-labelledby="demo-heading">
      <h2 id="demo-heading">PR Review Demo (Bitbucket PR checks)</h2>
      <form (ngSubmit)="add()" aria-labelledby="form-heading">
        <h3 id="form-heading" class="visually-hidden">Add review suggestion</h3>
        <div class="form-row">
          <label for="titleInput">Title</label>
          <input id="titleInput" [(ngModel)]="title" name="title" required aria-required="true" />
        </div>
        <div class="form-row">
          <label for="descInput">Description</label>
          <input id="descInput" [(ngModel)]="description" name="description" required aria-required="true" />
        </div>
  <button type="submit" class="btn btn-primary" [disabled]="!title || !description" [attr.aria-disabled]="(!title || !description) ? 'true' : 'false'">Add</button>
      </form>

      <section aria-live="polite" aria-atomic="false" class="review-list" *ngIf="reviews?.length; else emptyState">
        <div class="card" *ngFor="let r of reviews" [attr.aria-label]="'Review '+r.id">
          <h3>{{ r.title }}</h3>
          <p>{{ r.description }}</p>
          <label [for]="'status-'+r.id">Status</label>
          <select [id]="'status-'+r.id" [(ngModel)]="r.status" name="status-{{r.id}}" (change)="onStatusChange(r)" aria-describedby="statusHelp">
            <option value="open">open</option>
            <option value="accepted">accepted</option>
            <option value="rejected">rejected</option>
          </select>
          <small id="statusHelp" class="visually-hidden">Change review status</small>
          <button class="btn btn-secondary" (click)="remove(r.id)" aria-label="Remove review {{r.title}}">Remove</button>
        </div>
      </section>
      <ng-template #emptyState>
        <p>No reviews yet. Add one using the form above.</p>
      </ng-template>
    </div>
  `,
})
export class PrReviewDemoComponent implements OnDestroy {
  title = '';
  description = '';
  reviews: ReviewItem[] = [];
  private sub?: Subscription;
  // Intentionally unused to demonstrate ESLint annotations in Bitbucket
  private debugNote: string = 'Trigger ESLint checkstyle annotation';
  private tempValue = 42; // unused variable

  constructor(private svc: ReviewService) {
    this.sub = this.svc.reviews$.subscribe(list => (this.reviews = list));
    // Intentional console usage to trigger no-console rule
    console.log('Debug: component initialized');
  }

  add() {
    if (!this.title || !this.description) return;
    this.svc.add({ title: this.title, description: this.description });
    this.title = '';
    this.description = '';
  }
  remove(id: number) {
    this.svc.remove(id);
  }
  onStatusChange(r: ReviewItem) {
    this.svc.updateStatus(r.id!, r.status || 'open');
  }
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
