import { Option } from 'src/app/shared/model/option.model';

export interface Expense {
  id?: string | null;
  category: Option;
  amount: number;
  expenseDate: any;
  description: string;
  source?: Option;
}
