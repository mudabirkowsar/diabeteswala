import React from 'react'
import Stories from './components/Stories'
import HowItWorks from './components/HowItWorks'
import VarietyShowcase from './components/VarietyShowcase'

function page() {
  return (
    <div>
      <Stories />
      <HowItWorks />
      <VarietyShowcase />
    </div>
  )
}

export default page