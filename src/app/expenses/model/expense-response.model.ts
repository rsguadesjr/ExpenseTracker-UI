import { Option } from 'src/app/shared/model/option.model';
export interface ExpenseResponseModel {
  id?: string | null;
  category: Option;
  amount: number;
  expenseDate: any;
  description: string;
  source: Option;
  tags?: string[];
  createdDate?: string;
  modifiedDate?: string;
}
