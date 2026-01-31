export interface LocationData {
  latitude: number
  longitude: number
  timestamp: string
  accuracy: number
}

export interface GeolocationResult {
  success: boolean
  location?: LocationData
  error?: string
}

/**
 * Request current position from browser
 * Wraps navigator.geolocation.getCurrentPosition in a Promise
 */
export function getCurrentPosition(): Promise<GeolocationResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: 'Geolocation is not supported by your browser'
      })
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 0
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString(),
          accuracy: position.coords.accuracy
        }
        resolve({ success: true, location })
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please try again.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.'
            break
        }

        resolve({ success: false, error: errorMessage })
      },
      options
    )
  })
}

/**
 * Format location data to JSON string for database storage
 */
export function formatLocation(location: LocationData): string {
  return JSON.stringify(location)
}

/**
 * Parse location JSON string from database
 */
export function parseLocation(locationString: string): LocationData | null {
  try {
    return JSON.parse(locationString)
  } catch (error) {
    console.error('Failed to parse location:', error)
    return null
  }
}

/**
 * Calculate duration between two timestamps in hours:minutes format
 */
export function calculateDuration(clockIn: Date | string, clockOut: Date | string): string {
  const start = new Date(clockIn)
  const end = new Date(clockOut)
  const diffMs = end.getTime() - start.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(location: LocationData): string {
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
}

/**
 * Generate Google Maps link
 */
export function getGoogleMapsLink(location: LocationData): string {
  return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
}
