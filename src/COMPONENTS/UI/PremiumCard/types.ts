/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
export interface CardProps {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  badge?: string;
  verified?: boolean;
  status?: "online" | "offline" | "busy";
  variant?: "default" | "glass" | "gradient" | "outlined" | "neobrutal";
  loading?: boolean;
  favorite?: boolean;
  stats?: {
    label: string;
    value: string | number;
  }[];
  onProfile?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  icon?: React.ReactNode;
  children: React.ReactNode;
}
