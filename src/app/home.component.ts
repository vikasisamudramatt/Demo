import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="card">
      <h2>Welcome</h2>
      <p>This app demonstrates how an AI agent can assist with PR reviews on an Angular application.</p>
      <p>Use the navigation to explore the demo feature.</p>
    </div>
  `,
})
export class HomeComponent {}
