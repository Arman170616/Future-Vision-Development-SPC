export type FieldType =
  | 'text' | 'textarea' | 'email' | 'url' | 'slug' | 'password' | 'password_hash'
  | 'integer' | 'decimal' | 'boolean' | 'select' | 'date' | 'datetime' | 'time'
  | 'file' | 'fk' | 'm2m' | 'json' | 'readonly';

export interface FieldDesc {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help_text?: string;
  disabled?: boolean;
  choices?: [string, string][];
  target?: string;
  max_length?: number;
  image?: boolean;
}

export interface FileValue {
  name: string;
  url: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Value = any;

export interface Cell {
  text?: string;
  html?: string;
  bool?: boolean | null;
  file?: FileValue;
}

export interface Option {
  id: number | string;
  label: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  is_superuser: boolean;
  /** Set for team-member logins, which see a reduced panel ("My tasks") */
  team_member: { id: number; name: string; position: string } | null;
}

export interface ModelEntry {
  key: string;
  name: string;
  perms: { add: boolean; change: boolean; delete: boolean; view: boolean };
  view_only: boolean;
}

export interface AppEntry {
  app_label: string;
  name: string;
  models: ModelEntry[];
}

export interface RecentAction {
  action: 'add' | 'change' | 'delete';
  object_repr: string;
  object_id: string;
  model_key: string | null;
  model_name: string;
  time: string;
}

export interface IndexData {
  site_title: string;
  apps: AppEntry[];
  recent_actions: RecentAction[];
}

export interface ModelInfo {
  key: string;
  app_label: string;
  app_name: string;
  verbose_name: string;
  verbose_name_plural: string;
  perms: { add: boolean; change: boolean; delete: boolean; view: boolean };
}

export interface ChangeList {
  model: ModelInfo;
  columns: { name: string; label: string; sortable: boolean; editable: boolean; link: boolean }[];
  editable_fields: Record<string, FieldDesc>;
  rows: { id: number | string; str: string; cells: Record<string, Cell>; editable?: Record<string, Value> }[];
  filters: { name: string; label: string; value: string; options: { value: string; label: string }[] }[];
  search_enabled: boolean;
  search: string;
  date_hierarchy: null | {
    field: string;
    label: string;
    level: 'year' | 'month' | 'day';
    year: string;
    month: string;
    options: { value: string; label: string }[];
  };
  ordering: string;
  actions: { name: string; description: string }[];
  count: number;
  total_count: number;
  page: number;
  num_pages: number;
  per_page: number;
}

export interface Fieldset {
  name: string | null;
  description: string;
  classes: string[];
  lines: string[][];
}

export interface InlineRow {
  id: number | string;
  str: string;
  values: Record<string, Value>;
  readonly: Record<string, Cell>;
  labels: Record<string, Option[]>;
}

export interface InlineSchema {
  prefix: string;
  model: string;
  verbose_name: string;
  verbose_name_plural: string;
  style: 'tabular' | 'stacked';
  columns: FieldDesc[];
  rows: InlineRow[];
  empty: Record<string, Value>;
  extra: number;
  max_num: number;
  min_num: number;
  can_add: boolean;
  can_change: boolean;
  can_delete: boolean;
}

export interface FormData_ {
  model: ModelInfo;
  object: { id: number | string; str: string } | null;
  fieldsets: Fieldset[];
  fields: Record<string, FieldDesc>;
  values: Record<string, Value>;
  labels: Record<string, Option[]>;
  readonly_values: Record<string, Cell>;
  prepopulated: Record<string, string[]>;
  inlines: InlineSchema[];
  permissions: { save: boolean; delete: boolean; add: boolean };
  is_user_model: boolean;
}

export type FieldErrors = Record<string, string[]>;
