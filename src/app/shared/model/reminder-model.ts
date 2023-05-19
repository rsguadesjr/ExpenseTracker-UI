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
  sourceId: number,
  tags: string,
  startDate: any,
  endDate: any,
  type: ReminderType,


  date: Date, // will be one to check for the date
}
