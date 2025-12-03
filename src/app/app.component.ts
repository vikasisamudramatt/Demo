import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="container">
      <h1>Angular AI Agent PR Review Demo</h1>
      <nav>
        <a routerLink="/" routerLinkActive="active" aria-label="Home">Home</a> |
        <a routerLink="/demo" routerLinkActive="active" aria-label="PR Review Demo">PR Review Demo</a>
      </nav>
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent {
  // Intentional lint issues for CI testing
  private unusedFlag = true; // should trigger @typescript-eslint/no-unused-vars
  constructor() {
    // should trigger no-console
    console.log('Intentional console for lint test');
  }
}
