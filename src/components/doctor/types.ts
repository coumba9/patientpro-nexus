
export interface DocItem {
  id: number;
  name: string;
  type: string;
  date: string;
  size: string;
  patient: string;
  signed: boolean;
  content?: string;
}

export interface DocFormValues {
  name: string;
  type: string;
  patient: string;
  content: string;
}
