"use client";

import React, { useState, useEffect } from 'react';
import MainPage from './components/MainPage';
import Categories from './components/Categories';
import Outlets from './components/Outlets';
import FoodList from './components/FoodList';
import TodaysSpecial from './components/TodaySpecial';
import Combos from './components/Combos';
import OurTiffin from './components/OurTiffin';
import YourTiffin from './your-tiffin/page';
import Presence from './components/Presence';
import CartModal from './cart/page';
import AdvantagesModal from './components/AdvantagesModal';
import FoodByDisease from './components/FoodByDisease';
import WeeklyFood from './components/WeeklyFood';
import DayWiseFood from './components/DayWiseFood';

export default function FoodStorefront() {

  return (
    <>
      <MainPage />
      {/* <FoodList /> */}
      <DayWiseFood />
      <WeeklyFood />
      <Combos />
    </>
  );
}