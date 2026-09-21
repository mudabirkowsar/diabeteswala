import React from 'react'
import Stories from './components/Stories'
import HowItWorks from './components/HowItWorks'
import VarietyShowcase from './components/VarietyShowcase'
import AllHealthPlan from './components/AllHealthPlan'

function page() {
  return (
    <div>
      <Stories />
      <AllHealthPlan />
      <HowItWorks />
      <VarietyShowcase />
    </div>
  )
}

export default page