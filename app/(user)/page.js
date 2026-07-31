import React from 'react'
import Hero from './homePageComponents/Hero'
import MiniCarePrograms from './homePageComponents/MiniCarePrograms'
import HealthMetricsStrip from './homePageComponents/HealthMetricsStrip'
import ServiceShortcuts from './homePageComponents/ServiceShortcuts'
import HealthBanner from './homePageComponents/HealthBanner'
import LabBookingBanner from './homePageComponents/LabBookingBanner'
import DoctorShowcase from './homePageComponents/commonComponents/DoctorShowcase'
import LabTestShowcase from './homePageComponents/commonComponents/LabTestShowcase'
import ClinicShowcase from './homePageComponents/commonComponents/ClinicShowcase'
import MedicineShowcase from './homePageComponents/commonComponents/MedicineShowcase'
import DescriptionDiabetes from './homePageComponents/DescriptionDiabetes'
import HarmoneScience from './homePageComponents/HormoneScience'

function page() {
  return (
    <>
    <Hero />
    <MedicineShowcase />
    <MiniCarePrograms />
    <DescriptionDiabetes />
    {/* <HealthMetricsStrip /> */}
    <DoctorShowcase />
    <HealthBanner />
    <LabTestShowcase />
    <LabBookingBanner/>
    <ServiceShortcuts />
    <HarmoneScience />
    <ClinicShowcase />
    </>
  )
}

export default page
