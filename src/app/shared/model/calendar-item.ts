export interface CalendarItem {
  type: string;
  items: { value: any; date: Date; dateKey?: number }[];
  bgColor?: string | number;
}
