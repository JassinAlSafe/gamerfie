import { UseMutationResult } from '@tanstack/react-query';
import { ReviewUpdateData } from './game';

export interface GameMutationHandlers {
  updateGameStatus: UseMutationResult<
    { gameId: string; status: string },
    unknown,
    { gameId: string; status: string },
    unknown
  >;
  removeFromLibrary: UseMutationResult<
    string,
    Error,
    string,
    unknown
  >;
  onReviewUpdate: UseMutationResult<
    ReviewUpdateData,
    Error,
    ReviewUpdateData,
    unknown
  >;
  updateReview: UseMutationResult<
    { gameId: string; status: string },
    Error,
    ReviewUpdateData,
    unknown
  >;
} 