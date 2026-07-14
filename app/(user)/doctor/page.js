import React from 'react'
import Hero from './components/Hero'
import DoctorPromoBanner from './components/DoctorPromoBanner'
import TrustFeatures from './components/TrustFeatures'
import DoctorShowcase from './components/DoctorShowcase'

function page() {
    return (
        <>
        <Hero />
        <DoctorShowcase />
        <DoctorPromoBanner />
        <TrustFeatures />
        </>
    )
}

export default page
