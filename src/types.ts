export type TabType = 'content-plan' | 'newsletters' | 'settings';

export interface ContentPlanItem {
  id: string;
  date: string;
  channel: string;
  topic: string;
}

export interface NewsletterItem {
  id: string;
  text: string;
  channel: string;
  imageUrl?: string;
}
