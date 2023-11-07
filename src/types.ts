export interface Source {
  id: number;
  baseurl: string;
  logo_uri: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  password?: string;
  confirmPassword?: string;
  avatar_uri?: string;
  following?: User[];
  followers?: User[];
  summaries?: Summary[];
  expo_token?: string;
  profile?: string;
  trusted_sources?: Source[];
  show_favorites: boolean;
}

export interface AuthUser extends User {
  enable_push_notifications: boolean;
  enable_email_notifications: boolean;
  blocked_user_ids: number[];
}

export interface Snippet {
  id?: number;
  value: string;
  summary_id: number;
}

export interface Comment {
  id: number;
  snippet_id: number;
  comment: string;
  created_at: string;
  user_id: number;
  summary_id: number;
  avatar_uri?: string;
}

export interface Reaction {
  id: number;
  reaction: string;
  snippet_id: number;
  user_id: number;
  created_at: string;
  summary_id: number;
}

export interface ReactionMap {
  [reaction: string]: number;
}

export interface Share {
  id: number;
  summary_id: number;
  service: string;
  message: string;
}

export interface Follower {
  user_id: number;
  follower_id: number;
}

export interface Summary {
  id?: number;
  url: string;
  title: string;
  original_title: string;
  user_id: number;
  source_id: number;
  logo_uri: string;
  source_baseurl: string;
  avatar_uri?: string;
  username?: string;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
  comments: Comment[];
  reactions: Reaction[];
  snippets?: Snippet[];
  shares: Share[];
  author: User;
  is_watched?: boolean;
  uid: string;
  author_id: number;
  followers: Follower[];
  flagged_by?: number;
  is_public?: boolean;
}
