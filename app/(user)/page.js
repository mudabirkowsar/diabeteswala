import React from 'react'
import Hero from './homePageComponents/Hero'
import SomeMedicines from './homePageComponents/SomeMedicines'
import CarePrograms from './homePageComponents/CarePrograms'
import MiniCarePrograms from './homePageComponents/MiniCarePrograms'
import HealthMetricsStrip from './homePageComponents/HealthMetricsStrip'
import ServiceShortcuts from './homePageComponents/ServiceShortcuts'
import HealthBanner from './homePageComponents/HealthBanner'
import LabBookingBanner from './homePageComponents/LabBookingBanner'
import DoctorShowcase from './homePageComponents/commonComponents/DoctorShowcase'
import LabTestShowcase from './homePageComponents/commonComponents/LabTestShowcase'
import ClinicShowcase from './homePageComponents/commonComponents/ClinicShowcase'
import MedicineShowcase from './homePageComponents/commonComponents/MedicineShowcase'

function page() {
  return (
    <>
    <Hero />
    {/* <SomeMedicines /> */}
    <MedicineShowcase />
    {/* <CarePrograms /> */}
    <MiniCarePrograms />
    <LabBookingBanner/>
    <HealthMetricsStrip />
    <DoctorShowcase />
    <HealthBanner />
    <LabTestShowcase />
    <ServiceShortcuts />
    <ClinicShowcase />
    </>
  )
}

export default page
