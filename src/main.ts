import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { HomeComponent } from './app/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'demo',
    loadComponent: () => import('./app/features/pr-review-demo/pr-review-demo.component').then(m => m.PrReviewDemoComponent)
  }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
