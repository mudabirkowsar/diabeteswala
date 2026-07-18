import React from 'react'
import Hero from './components/Hero'
import ClinicShowcase from '../homePageComponents/commonComponents/ClinicShowcase'
import ClinicAdBanner from './components/ClinicAdBanner'
import HowItWorks from './components/HowItWorks'

function page() {
  return (
    <>
    <Hero />
    <ClinicShowcase />
    <ClinicAdBanner />
    <HowItWorks />
    </>
  )
}

export default page
