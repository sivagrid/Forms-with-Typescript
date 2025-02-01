export type FieldType = "text" | "textarea" | "radio" | "checkbox" | "select" | "date";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[];
}

export interface Form {
  id: string;
  name: string;
  fields: FormField[];
}

export interface FormResponse {
  id: string;
  formId: string;
  data: {[key: string] : string | string[]}
}

