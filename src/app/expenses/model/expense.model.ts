import { Option } from 'src/app/shared/model/option.model';

export interface Expense {
  id?: string | null;
  categoryId: number;
  category?: string;
  amount: number;
  expenseDate: any;
  description: string;
  sourceId?: number;
  source?: string;
  tags?: string[];
}
