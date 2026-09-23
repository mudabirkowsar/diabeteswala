import React from 'react'
import Hero from './components/Hero'
import HealthPlans from './components/HealthPlans'
import CupStory from './components/CupStory'
import BowlStory from './components/BowlStory'
import PrecisionHealthMatrix from './components/PrecisionHealthMatrix'
import ScrollSaladBowl from './components/ScrollSaladBowl'
import KineticScrollBanner from './components/KineticScrollBanner'
import CustomTiffinStory from '../components/CustomTiffinStory'
import SmoothieStory from '../components/SmoothieStory'
import TiffinStory2 from './components/TiffinStory2'

function page() {
  return (
    <>
      <Hero />
      <HealthPlans />
      <CupStory />
      {/* <BowlStory /> */}
      <PrecisionHealthMatrix />
      <CustomTiffinStory />
      {/* <ScrollSaladBowl /> */}
      <KineticScrollBanner />
      <SmoothieStory />
      {/* <TiffinStory2 />   */}
    </>
  )
}

export default page