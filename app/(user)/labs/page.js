import React from 'react'
import Hero from './components/Hero'
import LabTestShowcase from '../homePageComponents/commonComponents/LabTestShowcase'
import EcosystemPromo from './components/EcosystemPromo'
import NearbyLabs from './components/NearbyLabs'
import LabScienceInsights from './components/LabScienceInsights'


function page() {
    return (
        <>
            <Hero />
            <LabTestShowcase />
            <EcosystemPromo />
            <NearbyLabs />
            <LabScienceInsights />
        </>
    )
}

export default page
