import React from "react";
import type { WhiteCard } from "../types/game";

interface WhiteCardsHandProps {
  cards: WhiteCard[];
  selectedCardIds: string[];
  onCardSelect: (cardId: string) => void;
  disabled: boolean;
}

const WhiteCardsHand: React.FC<WhiteCardsHandProps> = ({
  cards,
  selectedCardIds,
  onCardSelect,
  disabled,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
        Your Cards
      </h3>
      
      <div className="flex flex-wrap gap-4 justify-center">
        {cards.map((card) => {
          const isSelected = selectedCardIds.includes(card.id);
          const selectionOrder = selectedCardIds.indexOf(card.id) + 1;
          
          return (
            <button
              key={card.id}
              onClick={() => !disabled && onCardSelect(card.id)}
              disabled={disabled}
              className={`
                relative w-48 h-64 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4 
                transition-all duration-200 transform
                ${isSelected 
                  ? 'ring-4 ring-blue-500 -translate-y-2' 
                  : 'hover:-translate-y-1 hover:shadow-xl'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed h-full flex items-center justify-center">
                {card.text}
              </div>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  {selectionOrder}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WhiteCardsHand;
