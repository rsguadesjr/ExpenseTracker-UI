import { ReminderType } from "../enums/reminder-type";

export interface ReminderRequestModel {
  id: number,
  subject: string,
  note: string,
  expenseDate: any,
  amount: number,
  categoryId: number,
  sourceId: number,
  tags: string,
  startDate: any,
  endDate: any,
  type: ReminderType,
}
