import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { Routes } from '@angular/router';

describe('AppComponent', () => {
  beforeEach(async () => {
    const routes: Routes = [
      { path: '', component: AppComponent },
      { path: 'demo', component: AppComponent },
    ];
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});