import React from 'react'
import Hero from './components/Hero'
import LabTestShowcase from '../homePageComponents/commonComponents/LabTestShowcase'
import EcosystemPromo from './components/EcosystemPromo'
import NearbyLabs from './components/NearbyLabs'
import LabScienceInsights from './components/LabScienceInsights'
import FindTestByOrgan from './components/FindTestByOrgan'
import LabPackageShowcase from '../homePageComponents/commonComponents/LabPackageShowcase'
import TestsByCategory from './components/TestsByCategory'
import DiabetesSpotlight from './components/DiabetesSpotlight'
import KnowMoreBanners from './components/KnowMoreBanners'
import MainCategory from './components/MainCategory'


function page() {
    return (
        <>
            <Hero />
            <KnowMoreBanners />
            <MainCategory />
            <LabTestShowcase />
            <TestsByCategory />
            <LabPackageShowcase />
            {/* <EcosystemPromo /> */}
            <DiabetesSpotlight />
            <FindTestByOrgan />
            <NearbyLabs />
            <LabScienceInsights />
        </>
    )
}

export default page
