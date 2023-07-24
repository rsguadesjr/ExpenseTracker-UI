import { ReminderType } from "src/app/shared/enums/reminder-type"

export interface ReminderModel {
  id: number,
  subject: string,
  note: string,
  userId: string,
  isActive: boolean,
  expenseDate: any,
  amount: number,
  categoryId: number,
  category: string;
  sourceId: number,
  source: string;
  tags: string,
  startDate: any,
  endDate: any,
  type: ReminderType,
  remainingDays?: number;


  date: Date, // will be one to check for the date
}
