export type FormattingMode = "light" | "standard" | "deep";
export type OutputStyle = "article" | "blog" | "product" | "faq" | "neutral";

export interface FormattingOptions {
  preserveWording: boolean;
  webReadable: boolean;
  autoHeadings: boolean;
}

export interface FormattingHistoryItem {
  id?: string;
  originalText: string;
  formattedText: string;
  mode: FormattingMode;
  style: OutputStyle;
  options: FormattingOptions;
  createdAt: any;
  userId: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
