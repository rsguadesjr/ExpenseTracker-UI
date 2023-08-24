export interface CategoryRequestModel {
  id: number | null;
  name: string;
  description: string;
  isActive: boolean;
  order?: number;
}
