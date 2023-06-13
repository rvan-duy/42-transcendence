export interface User {
  id: number;
  intraId: number;
  name: string;
  status: string;
  pending: [];
  friends: [];
  blocked: [];
  wins: number;
  losses: number;
  elo: number;
  rooms: [];
  admin: [];
  owns: [];
  games: [];
  twoFactor: boolean;
  secret: string;
  twoFactorVerified: boolean;
}

export enum RelationshipStatus {
	Friends = 'FRIENDS',
	Pending = 'PENDING',
	Accept = 'ACCEPT',
	Strangers = 'STRANGERS',
	Blocked = 'BLOCKED',
}
