import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ExpenseDetailRoutingModule } from "./expense-detail-routing.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExpenseDetailRoutingModule
  ]
})
export class ExpenseDetailModule {}
