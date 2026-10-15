import React from 'react'
import Hero from './components/Hero'
import PromoteCgm from './components/PromoteCgm'
import StepsToUse from './components/StepsToUse'
import CGMAdvertisement from './components/CGMAdvertisement'
import CgmProducts from './components/CgmProducts'
import ShowDiabetesCoach from '../../homePageComponents/commonComponents/ShowDiabetesCoach'

function page() {
  return (
    <>
    <Hero />
    <PromoteCgm />
    <CgmProducts />
    <ShowDiabetesCoach />
    <StepsToUse />
    <CGMAdvertisement />
    </>
  )
}

export default page
