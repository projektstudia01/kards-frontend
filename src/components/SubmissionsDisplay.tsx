import React from "react";
import type { Submission } from "../types/game";

interface SubmissionsDisplayProps {
  submissions: Submission[];
  onSelectWinner: (playerId: string) => void;
  isJudge: boolean;
}

const SubmissionsDisplay: React.FC<SubmissionsDisplayProps> = ({
  submissions,
  onSelectWinner,
  isJudge,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {submissions.map((submission) => (
          <div
            key={submission.playerId}
            className={`
              bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6
              ${isJudge ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 transition' : ''}
            `}
            onClick={() => isJudge && onSelectWinner(submission.playerId)}
          >
            <div className="space-y-3">
              {submission.cards.map((card, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm text-gray-800 dark:text-gray-200"
                >
                  {card.text}
                </div>
              ))}
            </div>
            
            {isJudge && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWinner(submission.playerId);
                }}
                className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Select This
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubmissionsDisplay;
