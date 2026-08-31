"use client";

import React, { useState, useEffect } from 'react';
import MainPage from './components/MainPage';
import Outlets from './components/Outlets';
import TodaysSpecial from './components/TodaySpecial';
import OurTiffin from './components/OurTiffin';
import YourTiffin from './your-tiffin/page';
import Presence from './components/Presence';
import CartModal from './cart/page';
import AdvantagesModal from './components/AdvantagesModal';
import FoodByDisease from './components/FoodByDisease';
import WeeklyFood from './components/WeeklyFood';
import DayWiseFood from './components/DayWiseFood';
import NearestMeal from './components/NearestMeal';
import GetNearComboOffers from './components/GetNearComboOffers';
import CustomTiffin from './components/CustomTiffin';

export default function FoodStorefront() {

  return (
    <>
      <MainPage />
      <NearestMeal />
      <GetNearComboOffers />
      <FoodByDisease/>
      <OurTiffin/>
      <CustomTiffin />


      {/* <DayWiseFood /> */}
      {/* <WeeklyFood /> */}
      {/* <YourTiffin /> */}
      {/* <Presence /> */}
    </>
  );
}