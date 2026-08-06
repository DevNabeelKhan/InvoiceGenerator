export interface CustomField {
  Id: number;
  Name: string;
  ArabicName?: string;
  AppliesTo: { sales: boolean; purchases: boolean; contacts: boolean };
  FieldLevel: 'Document' | 'Line';
  FieldType: string;
  Visible: boolean;
}
