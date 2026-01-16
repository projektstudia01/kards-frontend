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


  if (cards.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground text-center">
          Twoje karty
        </h3>
        <p className="text-center text-muted-foreground">
          Brak dostępnych kart
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground text-center">
        Twoje karty
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
                relative w-48 h-64 bg-card rounded-lg shadow-lg p-4 border border-border
                transition-all duration-200 transform
                ${isSelected
                  ? 'ring-4 ring-primary -translate-y-2'
                  : 'hover:-translate-y-1 hover:shadow-xl'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="text-sm text-card-foreground leading-relaxed h-full flex items-center justify-center">
                {card.text}
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
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
