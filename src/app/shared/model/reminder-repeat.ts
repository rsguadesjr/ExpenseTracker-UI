import { ReminderType } from "src/app/shared/enums/reminder-type";

export interface ReminderRepeat {
  reminderId: number,
  startDate: any,
  endDate: any,
  type: ReminderType
}
