export interface Recipient {
  id: string;
  address: string;
  name?: string;
  isFavorite: boolean;
  lastUsed: string; // ISO date string
  createdAt: string; // ISO date string
}

export interface CreateRecipientInput {
  address: string;
  name?: string;
  isFavorite?: boolean;
}

export interface UpdateRecipientInput {
  name?: string;
  isFavorite?: boolean;
}
