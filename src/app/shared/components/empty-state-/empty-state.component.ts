import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  standalone: true,
  styleUrls: [],
  imports: [
    CommonModule,
    NgOptimizedImage,
  ],
  
})

export class EmptyStateComponent {

}
