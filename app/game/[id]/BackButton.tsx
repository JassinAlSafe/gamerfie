'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BackButton() {
  return (
    <Button
      variant="link"
      className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors duration-200"
      onClick={() => window.history.back()}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
  )
}