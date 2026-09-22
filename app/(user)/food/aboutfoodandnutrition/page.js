import React from 'react'
import Hero from './components/Hero'
import HealthPlans from './components/HealthPlans'
import CupStory from './components/CupStory'
import BowlStory from './components/BowlStory'
import PrecisionHealthMatrix from './components/PrecisionHealthMatrix'
import ScrollSaladBowl from './components/ScrollSaladBowl'
import DiabetesNutrition3D from './components/DiabetesNutrition3D'
import Scroll3DSaladBowl from './components/ScrollSaladBowl'
import { ScrollTextBanner } from './components/ScrollTextBanner'
import KineticScrollBanner from './components/KineticScrollBanner'

function page() {
  return (
    <>
        <Hero/>
        <HealthPlans />
        <CupStory />
        {/* <BowlStory /> */}
        <PrecisionHealthMatrix />
        {/* <ScrollSaladBowl /> */}
        {/* <DiabetesNutrition3D /> */}
        {/* <ScrollTextBanner /> */}
        <KineticScrollBanner />
    </>
  )
}

export default page