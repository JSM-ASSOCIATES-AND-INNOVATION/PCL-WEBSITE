export interface DropdownItemType {
  label: string;
  link?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  badge?: string;
  disabled?: boolean;
  subItems?: DropdownItemType[];
}

export interface DropdownColumnType {
  title?: string | null;
  items: DropdownItemType[];
}

export interface DropdownMenuType {
  columns: DropdownColumnType[];
}
