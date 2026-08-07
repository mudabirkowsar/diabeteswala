import React from 'react'
import Hero from './homePageComponents/Hero'
import MiniCarePrograms from './homePageComponents/MiniCarePrograms'
import HealthMetricsStrip from './homePageComponents/HealthMetricsStrip'
import ServiceShortcuts from './homePageComponents/ServiceShortcuts'
import DoctorPromotion from './homePageComponents/DoctorPromotion'
import LabBookingBanner from './homePageComponents/LabBookingBanner'
import DoctorShowcase from './homePageComponents/commonComponents/DoctorShowcase'
import LabTestShowcase from './homePageComponents/commonComponents/LabTestShowcase'
import ClinicShowcase from './homePageComponents/commonComponents/ClinicShowcase'
import MedicineShowcase from './homePageComponents/commonComponents/MedicineShowcase'
import MedicinePromotion from './homePageComponents/MedicinePromotion'
import LabPromotion from './homePageComponents/LabPromotion'
import DiabetesScienceHub from './homePageComponents/DiabetesScienceHub'
import WayChooseDiabetesWala from './homePageComponents/WayChooseDiabetesWala'

function page() {
  return (
    <>
    <Hero />
    <MedicineShowcase />
    {/* <MiniCarePrograms /> */}
    <MedicinePromotion />
    <DoctorShowcase />
    <DoctorPromotion />
    <LabTestShowcase />
    {/* <ServiceShortcuts /> */}
    <WayChooseDiabetesWala />
    {/* <HealthMetricsStrip /> */}
    <ClinicShowcase />
    <LabPromotion />
    {/* <LabBookingBanner/> */}
    {/* <DiabetesScienceHub /> */}
    </>
  )
}

export default page
