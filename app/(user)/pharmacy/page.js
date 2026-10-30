import React from 'react'
import Hero from './components/Hero'
import MedicineShowcase from '../homePageComponents/commonComponents/MedicineShowcase'
import LatestAddedMedicines from '../homePageComponents/commonComponents/LatestAddedMedicines'

function page() {
  return (
    <>
      <Hero />
      <MedicineShowcase />
      <LatestAddedMedicines />
    </>
  )
}

export default page
