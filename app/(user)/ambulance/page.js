import React from 'react'
import Hero from './components/Hero'
import EmergencyServices from './components/EmergencyServices'
import AmbulancesList from '../homePageComponents/commonComponents/AmbulancesList'

function page() {
    return (
        <>
            <Hero />
            <AmbulancesList />
            <EmergencyServices />
        </>
    )
}

export default page
