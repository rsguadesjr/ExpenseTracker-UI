import { parseISO, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, add } from "date-fns";
import { ReminderType } from "src/app/shared/enums/reminder-type";
import { ReminderModel } from "src/app/shared/model/reminder-model";

export class ReminderHelper {

   /**
   *
   * @param reminders the reminder data to be transformed
   * @param param1 the date range specified
   * @returns the transformed data, this will create an item for each date occurence
   */
   public static process(reminders: ReminderModel[], { startDate, endDate }: { startDate: string, endDate: string}): ReminderModel[] {
    const _data: ReminderModel[] = [];
    const _endDate = new Date(endDate);

    // one time reminders
    const oneTimeReminders = reminders.filter(x => x.type == ReminderType.OneTime);
    _data.push(...oneTimeReminders.map(x => ({...x, date: parseISO(x.startDate) })));


    // recurring reminders
    const recurringReminders = reminders.filter(x => x.type != ReminderType.OneTime);
    for (let reminder of recurringReminders) {

      // determine the start date, startDate should be within the date range
      let rangeStartDate = new Date(startDate);
      let _currentReminderStartDate = new Date(reminder.startDate);
      if (rangeStartDate >= _currentReminderStartDate) {
        let month = rangeStartDate.getMonth();
        let year = rangeStartDate.getFullYear();
        let day = _currentReminderStartDate.getDate();
        _currentReminderStartDate = new Date(year, month, day);
      }

      let _currentReminderEndDate = reminder.endDate ? new Date(reminder.endDate) : _endDate;
      let dateDiff: number = 0;
      let key: string;

      if (reminder.type == ReminderType.Daily) {
        dateDiff = differenceInDays(_currentReminderStartDate, _currentReminderEndDate);
        key = 'days'
      }
      else if (reminder.type == ReminderType.Weekly) {
        dateDiff = differenceInWeeks(_currentReminderStartDate, _currentReminderEndDate);
        key = 'weeks'
      }
      else if (reminder.type == ReminderType.Monthly) {
        dateDiff = differenceInMonths(_currentReminderStartDate, _currentReminderEndDate);
        key = 'months'
      }
      else if (reminder.type == ReminderType.Yearly) {
        dateDiff = differenceInYears(_currentReminderStartDate, _currentReminderEndDate);
        key = 'years'
      }

      for(let i=0; i < (Math.abs(dateDiff) + 1); i++ ) {
        let duration: any = {};
        duration[key!] = i;
        const _newDate = add(_currentReminderStartDate, duration );
        _data.push(Object.assign({}, {...reminder, date: _newDate }));
      }
    }

    return _data;
  }
}
