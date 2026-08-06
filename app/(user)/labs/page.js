import React from 'react'
import Hero from './components/Hero'
import LabTestShowcase from '../homePageComponents/commonComponents/LabTestShowcase'
import EcosystemPromo from './components/EcosystemPromo'
import NearbyLabs from './components/NearbyLabs'
import LabScienceInsights from './components/LabScienceInsights'
import FindTestByOrgan from './components/FindTestByOrgan'


function page() {
    return (
        <>
            <Hero />
            <LabTestShowcase />
            <EcosystemPromo />
            <FindTestByOrgan />
            <NearbyLabs />
            <LabScienceInsights />
        </>
    )
}

export default page
