import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ExpenseDetailComponent } from "./expense-detail.component";

const routes: Routes = [
  {
    path: '',
    component: ExpenseDetailComponent
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpenseDetailRoutingModule {}
