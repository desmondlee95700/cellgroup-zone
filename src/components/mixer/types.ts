export interface Member {
  id: string;
  name: string;
  cg: string;
}

export interface Team {
  id: number;
  name: string;
  members: Member[];
  color: string;
  score?: number;
}

export interface ScoreAward {
  label: string;
  delta: number;
  title: string;
}
