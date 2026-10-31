import React from 'react'
import Hero from './components/Hero'
import MedicineShowcase from '../homePageComponents/commonComponents/MedicineShowcase'
import LatestAddedMedicines from '../homePageComponents/commonComponents/LatestAddedMedicines'
import HighestDiscountMedicines from '../homePageComponents/commonComponents/HighestDiscountMedicines'

function page() {
  return (
    <>
      <Hero />
      <MedicineShowcase />
      <LatestAddedMedicines />
      <HighestDiscountMedicines />
    </>
  )
}

export default page
