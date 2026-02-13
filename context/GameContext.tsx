import React, { createContext, useContext, ReactNode } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';

// Use ReturnType to automatically infer the types from the hook
type GameContextType = ReturnType<typeof useGameLogic>;

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const gameLogic = useGameLogic();
    return <GameContext.Provider value={gameLogic}>{children}</GameContext.Provider>;
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
