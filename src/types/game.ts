// Types for game based on README.md

export interface Card {
  id: string;
  text: string;
  type: 'white' | 'black';
  blankSpaceAmount: number;
}

export interface BlackCard extends Card {
  type: 'black';
}

export interface WhiteCard extends Card {
  type: 'white';
}

export interface Player {
  id: string;
  name: string;
  points: number;
  owner: boolean;
}

export interface Submission {
  playerId: string;
  playerName: string;
  cards: WhiteCard[];
}

export interface RoundStartedData {
  cards: WhiteCard[];
  cardRef: string; // player-uuid of judge
  blackCard: BlackCard;
}

export interface AllCardsSubmittedData {
  submissions: Submission[];
}

export interface RoundFinishedData {
  winner: {
    id: string;
    name: string;
    points: number;
  };
  players: Player[];
}

export interface GameState {
  gameId: string;
  currentJudgeId: string | null;
  blackCard: BlackCard | null;
  myCards: WhiteCard[];
  selectedCardIds: string[];
  submissions: Submission[];
  players: Player[];
  isJudge: boolean;
  gamePhase: 'waiting' | 'selecting' | 'judging' | 'results';
}
