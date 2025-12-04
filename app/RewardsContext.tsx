// app/components/RewardsContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface RewardPoint {
  id: string;
  type: 'ticket_purchase' | 'concession_purchase' | 'referral' | 'birthday';
  points: number;
  description: string;
  date: string;
  movieTitle?: string;
}

interface UserRewards {
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  history: RewardPoint[];
}

interface RewardsContextType {
  rewards: UserRewards;
  addPoints: (points: number, type: RewardPoint['type'], description: string, movieTitle?: string) => void;
  usePoints: (points: number, description: string) => boolean;
  getTier: () => string;
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export const useRewards = () => {
  const context = useContext(RewardsContext);
  if (!context) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
};

interface RewardsProviderProps {
  children: ReactNode;
}

export const RewardsProvider: React.FC<RewardsProviderProps> = ({ children }) => {
  const [rewards, setRewards] = useState<UserRewards>({
    totalPoints: 1250,
    availablePoints: 850,
    usedPoints: 400,
    tier: 'Gold',
    history: [
      { id: '1', type: 'ticket_purchase', points: 100, description: 'Movie Ticket - Spider-Man', date: '2024-01-15', movieTitle: 'Spider-Man: No Way Home' },
      { id: '2', type: 'concession_purchase', points: 50, description: 'Popcorn & Drink Combo', date: '2024-01-10' },
      { id: '3', type: 'ticket_purchase', points: 120, description: 'Movie Ticket - Dune', date: '2024-01-05', movieTitle: 'Dune: Part Two' },
    ],
  });

  const addPoints = (points: number, type: RewardPoint['type'], description: string, movieTitle?: string) => {
    const newPoint: RewardPoint = {
      id: Date.now().toString(),
      type,
      points,
      description,
      date: new Date().toISOString().split('T')[0],
      movieTitle,
    };

    setRewards(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + points,
      availablePoints: prev.availablePoints + points,
      history: [newPoint, ...prev.history],
      tier: calculateTier(prev.totalPoints + points),
    }));
  };

  const usePoints = (points: number, description: string): boolean => {
    if (points > rewards.availablePoints) {
      return false;
    }

    setRewards(prev => ({
      ...prev,
      availablePoints: prev.availablePoints - points,
      usedPoints: prev.usedPoints + points,
      history: [{
        id: Date.now().toString(),
        type: 'concession_purchase',
        points: -points,
        description: `Used points: ${description}`,
        date: new Date().toISOString().split('T')[0],
      }, ...prev.history],
    }));

    return true;
  };

  const calculateTier = (points: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' => {
    if (points >= 5000) return 'Platinum';
    if (points >= 2000) return 'Gold';
    if (points >= 500) return 'Silver';
    return 'Bronze';
  };

  const getTier = () => rewards.tier;

  return (
    <RewardsContext.Provider value={{ rewards, addPoints, usePoints, getTier }}>
      {children}
    </RewardsContext.Provider>
  );
};