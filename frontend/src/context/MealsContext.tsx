import { createContext, useContext, useState, ReactNode } from 'react';
import { Meal } from '@/types';
import { meals as initialMeals } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

interface MealsContextType {
  meals: Meal[];
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  updateMeal: (id: string, meal: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  getMealsByRestaurant: (restaurantId: string) => Meal[];
}

const MealsContext = createContext<MealsContextType | undefined>(undefined);

export function MealsProvider({ children }: { children: ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);

  const addMeal = (mealData: Omit<Meal, 'id'>) => {
    const newMeal: Meal = {
      ...mealData,
      id: `m${Date.now()}`,
    };
    setMeals((prev) => [...prev, newMeal]);
    toast({
      title: "Meal added",
      description: `${newMeal.name} has been added to the menu`,
    });
  };

  const updateMeal = (id: string, mealData: Partial<Meal>) => {
    setMeals((prev) =>
      prev.map((meal) => (meal.id === id ? { ...meal, ...mealData } : meal))
    );
    toast({
      title: "Meal updated",
      description: "The meal has been updated successfully",
    });
  };

  const deleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== id));
    toast({
      title: "Meal deleted",
      description: "The meal has been removed from the menu",
    });
  };

  const getMealsByRestaurant = (restaurantId: string) => {
    return meals.filter((meal) => meal.restaurantId === restaurantId);
  };

  return (
    <MealsContext.Provider
      value={{ meals, addMeal, updateMeal, deleteMeal, getMealsByRestaurant }}
    >
      {children}
    </MealsContext.Provider>
  );
}

export function useMeals() {
  const context = useContext(MealsContext);
  if (context === undefined) {
    throw new Error('useMeals must be used within a MealsProvider');
  }
  return context;
}
