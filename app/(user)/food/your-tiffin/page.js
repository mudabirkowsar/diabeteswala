'use client';

import React, { useState, useEffect } from 'react';
import TiffinBanner from './components/TiffinBanner';
import TiffinModal from './components/TiffinModal';

const builderIngredients = {
  bases: [
    { id: 'cauli-rice', name: 'Sautéed Cauliflower Rice', price: 60, calories: 45, netCarbs: 3, protein: 2, gi: 15, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80" },
    { id: 'brown-rice', name: 'Steamed Brown Basmati', price: 40, calories: 150, netCarbs: 30, protein: 3, gi: 50, imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&auto=format&fit=crop&q=80" },
    { id: 'quinoa', name: 'Organic Pearled Quinoa', price: 70, calories: 140, netCarbs: 25, protein: 5, gi: 43, imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=150&auto=format&fit=crop&q=80" }
  ],
  proteins: [
    { id: 'tofu', name: 'Grilled Herb Tofu Cubes', price: 90, calories: 120, netCarbs: 2, protein: 12, gi: 15, imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150&auto=format&fit=crop&q=80" },
    { id: 'paneer', name: 'Baked Low-Fat Paneer', price: 100, calories: 180, netCarbs: 3, protein: 16, gi: 15, imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=150&auto=format&fit=crop&q=80" },
    { id: 'chicken', name: 'Olive Oil Grilled Chicken', price: 130, calories: 165, netCarbs: 0, protein: 31, gi: 0, imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=150&auto=format&fit=crop&q=80" }
  ],
  fibers: [
    { id: 'broccoli', name: 'Garlic Steamed Broccoli', price: 40, calories: 35, netCarbs: 4, protein: 2, gi: 15, imageUrl: "https://images.unsplash.com/photo-1584005397045-bf4af2c0cc76?w=150&auto=format&fit=crop&q=80" },
    { id: 'spinach', name: 'Wilted Spinach Saag', price: 35, calories: 40, netCarbs: 2, protein: 3, gi: 15, imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=150&auto=format&fit=crop&q=80" },
    { id: 'asparagus', name: 'Wok-Tossed Asparagus Greens', price: 60, calories: 30, netCarbs: 3, protein: 2, gi: 15, imageUrl: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=150&auto=format&fit=crop&q=80" }
  ]
};

// Generates initial 7-day cyclical template structure
const getInitialWeeklySetup = () => {
  const defaultPlate = {
    breakfast: { base: 'cauli-rice', protein: 'tofu', fiber: 'broccoli' },
    lunch: { base: 'brown-rice', protein: 'paneer', fiber: 'spinach' },
    dinner: { base: 'quinoa', protein: 'chicken', fiber: 'asparagus' }
  };
  return {
    monday: JSON.parse(JSON.stringify(defaultPlate)),
    tuesday: JSON.parse(JSON.stringify(defaultPlate)),
    wednesday: JSON.parse(JSON.stringify(defaultPlate)),
    thursday: JSON.parse(JSON.stringify(defaultPlate)),
    friday: JSON.parse(JSON.stringify(defaultPlate)),
    saturday: JSON.parse(JSON.stringify(defaultPlate)),
    sunday: JSON.parse(JSON.stringify(defaultPlate))
  };
};

export default function YourTiffin({ onAddToCart }) {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [activeSlotTab, setActiveSlotTab] = useState('lunch'); 
  const [activeDayTab, setActiveDayTab] = useState('monday'); // New day-wise active tab

  // Configurations
  const [mealsPerDayLimit, setMealsPerDayLimit] = useState(2); 
  const [durationMode, setDurationMode] = useState('monthly'); 
  const [customDaysCount, setCustomDaysCount] = useState(10); 
  const [selectedSlots, setSelectedSlots] = useState(['lunch', 'dinner']);

  // Refactored State: Mapped Day-wise (Monday to Sunday)
  const [weeklyCustomMeals, setWeeklyCustomMeals] = useState(getInitialWeeklySetup());

  const [deliveryTimes, setDeliveryTimes] = useState({
    breakfast: '8:00 AM',
    lunch: '1:00 PM',
    dinner: '8:00 PM'
  });

  useEffect(() => {
    if (mealsPerDayLimit === 1) {
      setSelectedSlots(['lunch']);
      setActiveSlotTab('lunch');
    } else if (mealsPerDayLimit === 2) {
      setSelectedSlots(['lunch', 'dinner']);
      setActiveSlotTab('lunch');
    } else if (mealsPerDayLimit === 3) {
      setSelectedSlots(['breakfast', 'lunch', 'dinner']);
      setActiveSlotTab('lunch');
    }
  }, [mealsPerDayLimit]);

  const handleSlotToggle = (slot) => {
    if (mealsPerDayLimit === 3) return;

    if (mealsPerDayLimit === 1) {
      setSelectedSlots([slot]);
      setActiveSlotTab(slot);
    } else if (mealsPerDayLimit === 2) {
      if (selectedSlots.includes(slot)) {
        if (selectedSlots.length > 1) {
          setSelectedSlots(selectedSlots.filter(s => s !== slot));
          if (activeSlotTab === slot) {
            setActiveSlotTab(selectedSlots.filter(s => s !== slot)[0]);
          }
        }
      } else {
        if (selectedSlots.length < 2) {
          setSelectedSlots([...selectedSlots, slot]);
          setActiveSlotTab(slot);
        } else {
          setSelectedSlots([selectedSlots[1], slot]);
          setActiveSlotTab(slot);
        }
      }
    }
  };

  const getIngredient = (category, id) => {
    return builderIngredients[category].find(item => item.id === id);
  };

  // Refactored Handler: Writes selections on specific Days of the week
  const handleIngredientChange = (day, slot, category, ingredientId) => {
    setWeeklyCustomMeals(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: {
          ...prev[day][slot],
          [category]: ingredientId
        }
      }
    }));
  };

  const handleTimeChange = (slot, time) => {
    setDeliveryTimes(prev => ({ ...prev, [slot]: time }));
  };

  // Calculates single day menu metrics
  const calculateDayPlateCost = (day) => {
    let dayPrice = 0;
    let dayCalories = 0;
    let dayCarbs = 0;
    let dayProtein = 0;

    selectedSlots.forEach((slot) => {
      const meal = weeklyCustomMeals[day][slot];
      const base = getIngredient('bases', meal.base);
      const protein = getIngredient('proteins', meal.protein);
      const fiber = getIngredient('fibers', meal.fiber);

      dayPrice += base.price + protein.price + fiber.price;
      dayCalories += base.calories + protein.calories + fiber.calories;
      dayCarbs += base.netCarbs + protein.netCarbs + fiber.netCarbs;
      dayProtein += base.protein + protein.protein + fiber.protein;
    });

    return { price: dayPrice, calories: dayCalories, carbs: dayCarbs, protein: dayProtein };
  };

  // Calculates total price by multiplying daily average against duration mode terms
  const getRollingCostSummary = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    let weeklyTotalBasePrice = 0;

    days.forEach(day => {
      weeklyTotalBasePrice += calculateDayPlateCost(day).price;
    });

    const averageDailyPrice = weeklyTotalBasePrice / 7;

    let daysMultiplier = 1;
    let discountRate = 0;

    if (durationMode === 'weekly') {
      daysMultiplier = 7;
      discountRate = 0.10;
    } else if (durationMode === 'monthly') {
      daysMultiplier = 30;
      discountRate = 0.20;
    } else if (durationMode === 'custom') {
      daysMultiplier = customDaysCount;
      discountRate = customDaysCount > 15 ? 0.08 : 0;
    }

    const baseProgramCost = Math.round(averageDailyPrice * daysMultiplier);
    const savingsAmount = Math.round(baseProgramCost * discountRate);
    const finalCalculatedCost = baseProgramCost - savingsAmount;

    return { daysMultiplier, discountRate, savingsAmount, finalCalculatedCost };
  };

  const { daysMultiplier, discountRate, savingsAmount, finalCalculatedCost } = getRollingCostSummary();

  // Diagnostics specifically for the currently viewed Day tab
  const activeDayMetrics = calculateDayPlateCost(activeDayTab);

  return (
    <div className="relative">
      <TiffinBanner onLaunch={() => setIsBuilderOpen(true)} />

      {isBuilderOpen && (
        <TiffinModal
          onClose={() => setIsBuilderOpen(false)}
          mealsPerDayLimit={mealsPerDayLimit}
          setMealsPerDayLimit={setMealsPerDayLimit}
          selectedSlots={selectedSlots}
          handleSlotToggle={handleSlotToggle}
          activeSlotTab={activeSlotTab}
          setActiveSlotTab={setActiveSlotTab}
          activeDayTab={activeDayTab}
          setActiveDayTab={setActiveDayTab}
          weeklyCustomMeals={weeklyCustomMeals}
          getIngredient={getIngredient}
          handleIngredientChange={handleIngredientChange}
          deliveryTimes={deliveryTimes}
          handleTimeChange={handleTimeChange}
          durationMode={durationMode}
          setDurationMode={setDurationMode}
          customDaysCount={customDaysCount}
          setCustomDaysCount={setCustomDaysCount}
          dailyCalories={activeDayMetrics.calories}  // Active Day Diagnostics
          dailyCarbs={activeDayMetrics.carbs}        // Active Day Diagnostics
          dailyProtein={activeDayMetrics.protein}    // Active Day Diagnostics
          discountRate={discountRate}
          savingsAmount={savingsAmount}
          daysMultiplier={daysMultiplier}
          finalCalculatedCost={finalCalculatedCost}
          builderIngredients={builderIngredients}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
}