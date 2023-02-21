export interface MsgDto {
  id: number;
  roomId: number;
  body: string;
  authorId: number;
  invite: boolean;
}
