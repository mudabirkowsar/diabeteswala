import React from 'react'
import Hero from './components/Hero'
import MedicineShowcase from '../homePageComponents/commonComponents/MedicineShowcase'
import PharmacyCart from '../otherscreens/carts/PharmacyCart'

function page() {
  return (
    <>
      <Hero />
      <MedicineShowcase />
      <PharmacyCart/>
    </>
  )
}

export default page
