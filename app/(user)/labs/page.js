import React from 'react'
import Hero from './components/Hero'
import LabTestShowcase from '../homePageComponents/commonComponents/LabTestShowcase'
import EcosystemPromo from './components/EcosystemPromo'
import NearbyLabs from './components/NearbyLabs'


function page() {
    return (
        <>
            <Hero />
            <LabTestShowcase />
            <EcosystemPromo />
            <NearbyLabs />
        </>
    )
}

export default page
