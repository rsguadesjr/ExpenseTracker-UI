export interface SummaryFilter {
  view: string;
  startDate: Date;
  endDate: Date;
  categoryIds: number[];
  breakdown: boolean;
  showBudget?: boolean;
}
