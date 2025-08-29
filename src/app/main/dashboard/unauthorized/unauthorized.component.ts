import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  template: `
    <div class="py-8">
      <h1 class="text-center m-0">Unauthorized</h1>
      <p class="text-center m-0 py-4">You do not have access to this page.</p>
    </div>
  `,
})

export class UnauthorizedComponent {

}
