import { CommonModule, DatePipe, NgOptimizedImage } from "@angular/common";
import { NgModule } from "@angular/core";
import { EmptyStateComponent } from "./components/empty-state-/empty-state.component";

const COMPS: Array<any> = [
  
];

@NgModule({
  declarations: [...COMPS],
  imports: [
    CommonModule,
    NgOptimizedImage
  ],
  exports: [
    ...COMPS,
    
  ],
  providers: []
})
export class SharedModule {}
