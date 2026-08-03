import React from 'react'
import Hero from './components/Hero'
import DoctorPromoBanner from './components/DoctorPromoBanner'
import TrustFeatures from './components/TrustFeatures'
import DoctorShowcase from '../homePageComponents/commonComponents/DoctorShowcase'
import EndocrineInsights from './components/EndocrineInsights'

function page() {
    return (
        <>
        <Hero />
        <DoctorShowcase />
        <EndocrineInsights />
        <DoctorPromoBanner />
        <TrustFeatures />
        </>
    )
}

export default page
