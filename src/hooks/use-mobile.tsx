
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initial check during SSR/first render
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false
  })

  React.useEffect(() => {
    // Function to detect if the device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Run once on mount
    checkMobile()
    
    // Set up resize listener
    window.addEventListener('resize', checkMobile)
    
    // Use matchMedia for better device detection
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange)
    } 
    // Older browsers
    else if ('addListener' in mediaQuery) {
      // @ts-ignore - For older browsers
      mediaQuery.addListener(handleMediaChange)
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange)
      } 
      else if ('removeListener' in mediaQuery) {
        // @ts-ignore - For older browsers
        mediaQuery.removeListener(handleMediaChange)
      }
    }
  }, [])

  return isMobile
}
