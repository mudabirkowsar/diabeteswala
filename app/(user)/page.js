import React from 'react'
import Hero from './homePageComponents/Hero'
import SomeMedicines from './homePageComponents/SomeMedicines'
import CarePrograms from './homePageComponents/CarePrograms'
import MiniCarePrograms from './homePageComponents/MiniCarePrograms'
import HealthMetricsStrip from './homePageComponents/HealthMetricsStrip'
import ServiceShortcuts from './homePageComponents/ServiceShortcuts'
import HealthBanner from './homePageComponents/HealthBanner'
import LabBookingBanner from './homePageComponents/LabBookingBanner'
function page() {
  return (
    <>
    <Hero />
    <SomeMedicines />
    {/* <CarePrograms /> */}
    <MiniCarePrograms />
    <LabBookingBanner/>
    <HealthMetricsStrip />
    <HealthBanner />
    <ServiceShortcuts />
    </>
  )
}

export default page
