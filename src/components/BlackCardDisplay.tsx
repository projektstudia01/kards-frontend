import React from "react";
import type { BlackCard } from "../types/game";

interface BlackCardDisplayProps {
  card: BlackCard;
}

const BlackCardDisplay: React.FC<BlackCardDisplayProps> = ({ card }) => {
  // Replace _ with blank spaces for display
  const displayText = card.text.replace(/_/g, "______");

  return (
    <div className="w-64 h-80 bg-black text-white rounded-lg shadow-xl p-6 flex flex-col justify-between">
      <div className="text-lg font-semibold leading-relaxed">
        {displayText}
      </div>
      
      <div className="text-xs text-gray-400 text-right">
        {card.blankSpaceAmount > 1 && (
          <span>Pick {card.blankSpaceAmount}</span>
        )}
      </div>
    </div>
  );
};

export default BlackCardDisplay;
