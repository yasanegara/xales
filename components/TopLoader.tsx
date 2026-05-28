'use client'

import { AppProgressBar } from 'next-nprogress-bar'

export default function TopLoader() {
  return (
    <AppProgressBar
      height="2px"
      color="#1a1a1a"
      options={{ showSpinner: false, trickleSpeed: 200 }}
      shallowRouting
    />
  )
}
