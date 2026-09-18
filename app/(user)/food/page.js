"use client";

import MainPage from './components/MainPage';
import OurTiffin from './components/OurTiffin';
import FoodByDisease from './components/FoodByDisease';
import NearestMeal from './components/NearestMeal';
import GetNearComboOffers from './components/GetNearComboOffers';
import CustomTiffin from './components/CustomTiffin';
import HowToCustomize from './components/HowToCustomize';
import Testimonials from './components/Testimonials';
import MarqueeStrip from './components/MarqueeStrip';
import GenderPrograms from './components/GenderPrograms';
import HomeOfferingsShowcase from './components/HomeOfferingsShowcase';

export default function FoodStorefront() {

  return (
    <>
      <MainPage /> a
      <MarqueeStrip />
      <HomeOfferingsShowcase />
      <NearestMeal />
      <HowToCustomize />
      <GetNearComboOffers /> 
      <FoodByDisease />
      <OurTiffin />
      <CustomTiffin />
      <GenderPrograms />
      <Testimonials />
    </>
  );
}