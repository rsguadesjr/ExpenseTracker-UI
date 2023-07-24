export interface DataTableColumn {
  header: string;
  field: string;
  /**
   * Custom way to format a value
   * @param value current object of the array
   * @param index current index of the array
   * @returns string
   */
  formatValue?: (value: any, index: number) => string;
  /**
   *
   */
  html?: (value: any, index: number) => string;
  width?: number | string;

  type?: 'button';
  icon?: string;
  label?: string;
  onClick?: (value: any, index: number) => void;
}
