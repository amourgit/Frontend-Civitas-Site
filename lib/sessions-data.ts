// Types
export interface SessionLocation {
  city: string
  country: string
  countryCode: string
  lat: number
  lng: number
}

export interface ActivityData {
  time: string
  requests: number
}

export interface BandwidthData {
  time: string
  value: number
}

export interface Session {
  id: string
  deviceType: "desktop" | "laptop" | "tablet" | "mobile" | "unknown"
  deviceName: string
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  ip: string
  location: SessionLocation
  createdAt: string
  lastActivity: string
  isCurrentSession: boolean
  status: "active" | "idle" | "suspicious"
  riskLevel: "low" | "medium" | "high"
  requestsCount: number
  dataTransferred: number
  avgResponseTime: number
  failedAttempts: number
  twoFactorEnabled: boolean
  vpnDetected: boolean
  activityHistory: ActivityData[]
  bandwidthHistory: BandwidthData[]
}

// GET /tokens/sessions - Liste des sessions actives
export const sessionsData: Session[] = [
  {
    id: "sess-001",
    deviceType: "desktop",
    deviceName: "MacBook Pro 16\"",
    browser: "Chrome",
    browserVersion: "124.0.6367.118",
    os: "macOS Sonoma",
    osVersion: "14.4.1",
    ip: "192.168.1.42",
    location: {
      city: "Paris",
      country: "France",
      countryCode: "FR",
      lat: 48.8566,
      lng: 2.3522
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 30 * 1000).toISOString(),
    isCurrentSession: true,
    status: "active",
    riskLevel: "low",
    requestsCount: 2847,
    dataTransferred: 156,
    avgResponseTime: 42,
    failedAttempts: 0,
    twoFactorEnabled: true,
    vpnDetected: false,
    activityHistory: [
      { time: "0h", requests: 45 },
      { time: "2h", requests: 78 },
      { time: "4h", requests: 92 },
      { time: "6h", requests: 65 },
      { time: "8h", requests: 110 },
      { time: "10h", requests: 156 },
      { time: "12h", requests: 189 },
      { time: "14h", requests: 234 },
      { time: "16h", requests: 278 },
      { time: "18h", requests: 312 },
      { time: "20h", requests: 345 },
      { time: "22h", requests: 298 }
    ],
    bandwidthHistory: [
      { time: "0h", value: 12 },
      { time: "2h", value: 18 },
      { time: "4h", value: 24 },
      { time: "6h", value: 15 },
      { time: "8h", value: 32 },
      { time: "10h", value: 45 },
      { time: "12h", value: 52 },
      { time: "14h", value: 48 },
      { time: "16h", value: 38 },
      { time: "18h", value: 29 },
      { time: "20h", value: 22 },
      { time: "22h", value: 18 }
    ]
  },
  {
    id: "sess-002",
    deviceType: "mobile",
    deviceName: "iPhone 15 Pro Max",
    browser: "Safari",
    browserVersion: "17.4.1",
    os: "iOS",
    osVersion: "17.4.1",
    ip: "82.66.142.89",
    location: {
      city: "Lyon",
      country: "France",
      countryCode: "FR",
      lat: 45.764,
      lng: 4.8357
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    isCurrentSession: false,
    status: "active",
    riskLevel: "low",
    requestsCount: 1256,
    dataTransferred: 89,
    avgResponseTime: 68,
    failedAttempts: 1,
    twoFactorEnabled: true,
    vpnDetected: false,
    activityHistory: [
      { time: "0h", requests: 12 },
      { time: "2h", requests: 8 },
      { time: "4h", requests: 5 },
      { time: "6h", requests: 22 },
      { time: "8h", requests: 45 },
      { time: "10h", requests: 67 },
      { time: "12h", requests: 89 },
      { time: "14h", requests: 102 },
      { time: "16h", requests: 78 },
      { time: "18h", requests: 56 },
      { time: "20h", requests: 34 },
      { time: "22h", requests: 23 }
    ],
    bandwidthHistory: [
      { time: "0h", value: 5 },
      { time: "2h", value: 3 },
      { time: "4h", value: 2 },
      { time: "6h", value: 8 },
      { time: "8h", value: 15 },
      { time: "10h", value: 22 },
      { time: "12h", value: 28 },
      { time: "14h", value: 32 },
      { time: "16h", value: 25 },
      { time: "18h", value: 18 },
      { time: "20h", value: 12 },
      { time: "22h", value: 8 }
    ]
  },
  {
    id: "sess-003",
    deviceType: "laptop",
    deviceName: "Dell XPS 15",
    browser: "Firefox",
    browserVersion: "125.0.3",
    os: "Windows 11",
    osVersion: "23H2",
    ip: "185.220.101.45",
    location: {
      city: "Amsterdam",
      country: "Netherlands",
      countryCode: "NL",
      lat: 52.3676,
      lng: 4.9041
    },
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    isCurrentSession: false,
    status: "idle",
    riskLevel: "medium",
    requestsCount: 3421,
    dataTransferred: 234,
    avgResponseTime: 125,
    failedAttempts: 3,
    twoFactorEnabled: true,
    vpnDetected: true,
    activityHistory: [
      { time: "0h", requests: 89 },
      { time: "2h", requests: 145 },
      { time: "4h", requests: 178 },
      { time: "6h", requests: 212 },
      { time: "8h", requests: 256 },
      { time: "10h", requests: 189 },
      { time: "12h", requests: 145 },
      { time: "14h", requests: 98 },
      { time: "16h", requests: 67 },
      { time: "18h", requests: 45 },
      { time: "20h", requests: 23 },
      { time: "22h", requests: 12 }
    ],
    bandwidthHistory: [
      { time: "0h", value: 25 },
      { time: "2h", value: 42 },
      { time: "4h", value: 58 },
      { time: "6h", value: 65 },
      { time: "8h", value: 72 },
      { time: "10h", value: 55 },
      { time: "12h", value: 42 },
      { time: "14h", value: 28 },
      { time: "16h", value: 18 },
      { time: "18h", value: 12 },
      { time: "20h", value: 8 },
      { time: "22h", value: 5 }
    ]
  },
  {
    id: "sess-004",
    deviceType: "tablet",
    deviceName: "iPad Pro 12.9\"",
    browser: "Safari",
    browserVersion: "17.4",
    os: "iPadOS",
    osVersion: "17.4.1",
    ip: "90.83.124.67",
    location: {
      city: "Marseille",
      country: "France",
      countryCode: "FR",
      lat: 43.2965,
      lng: 5.3698
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isCurrentSession: false,
    status: "idle",
    riskLevel: "low",
    requestsCount: 567,
    dataTransferred: 45,
    avgResponseTime: 78,
    failedAttempts: 0,
    twoFactorEnabled: true,
    vpnDetected: false,
    activityHistory: [
      { time: "0h", requests: 8 },
      { time: "2h", requests: 12 },
      { time: "4h", requests: 5 },
      { time: "6h", requests: 18 },
      { time: "8h", requests: 34 },
      { time: "10h", requests: 45 },
      { time: "12h", requests: 52 },
      { time: "14h", requests: 38 },
      { time: "16h", requests: 28 },
      { time: "18h", requests: 22 },
      { time: "20h", requests: 15 },
      { time: "22h", requests: 10 }
    ],
    bandwidthHistory: [
      { time: "0h", value: 3 },
      { time: "2h", value: 5 },
      { time: "4h", value: 2 },
      { time: "6h", value: 8 },
      { time: "8h", value: 12 },
      { time: "10h", value: 18 },
      { time: "12h", value: 22 },
      { time: "14h", value: 15 },
      { time: "16h", value: 10 },
      { time: "18h", value: 8 },
      { time: "20h", value: 5 },
      { time: "22h", value: 3 }
    ]
  },
  {
    id: "sess-005",
    deviceType: "desktop",
    deviceName: "Custom Gaming PC",
    browser: "Brave",
    browserVersion: "1.65.114",
    os: "Windows 11",
    osVersion: "23H2",
    ip: "91.121.87.203",
    location: {
      city: "Moscow",
      country: "Russia",
      countryCode: "RU",
      lat: 55.7558,
      lng: 37.6173
    },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isCurrentSession: false,
    status: "suspicious",
    riskLevel: "high",
    requestsCount: 8934,
    dataTransferred: 892,
    avgResponseTime: 245,
    failedAttempts: 12,
    twoFactorEnabled: false,
    vpnDetected: true,
    activityHistory: [
      { time: "0h", requests: 456 },
      { time: "2h", requests: 678 },
      { time: "4h", requests: 892 },
      { time: "6h", requests: 1023 },
      { time: "8h", requests: 1156 },
      { time: "10h", requests: 987 },
      { time: "12h", requests: 756 },
      { time: "14h", requests: 543 },
      { time: "16h", requests: 432 },
      { time: "18h", requests: 345 },
      { time: "20h", requests: 234 },
      { time: "22h", requests: 178 }
    ],
    bandwidthHistory: [
      { time: "0h", value: 78 },
      { time: "2h", value: 95 },
      { time: "4h", value: 112 },
      { time: "6h", value: 135 },
      { time: "8h", value: 148 },
      { time: "10h", value: 125 },
      { time: "12h", value: 98 },
      { time: "14h", value: 72 },
      { time: "16h", value: 55 },
      { time: "18h", value: 42 },
      { time: "20h", value: 32 },
      { time: "22h", value: 25 }
    ]
  },
  {
    id: "sess-006",
    deviceType: "mobile",
    deviceName: "Samsung Galaxy S24 Ultra",
    browser: "Chrome",
    browserVersion: "124.0.6367.82",
    os: "Android",
    osVersion: "14",
    ip: "176.149.78.234",
    location: {
      city: "Berlin",
      country: "Germany",
      countryCode: "DE",
      lat: 52.52,
      lng: 13.405
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    isCurrentSession: false,
    status: "idle",
    riskLevel: "low",
    requestsCount: 892,
    dataTransferred: 67,
    avgResponseTime: 95,
    failedAttempts: 0,
    twoFactorEnabled: true,
    vpnDetected: false,
    activityHistory: [
      { time: "0h", requests: 15 },
      { time: "2h", requests: 22 },
      { time: "4h", requests: 8 },
      { time: "6h", requests: 35 },
      { time: "8h", requests: 56 },
      { time: "10h", requests: 78 },
      { time: "12h", requests: 89 },
      { time: "14h", requests: 72 },
      { time: "16h", requests: 58 },
      { time: "18h", requests: 42 },
      { time: "20h", requests: 28 },
      { time: "22h", requests: 18 }
    ],
    bandwidthHistory: [
      { time: "0h", value: 4 },
      { time: "2h", value: 6 },
      { time: "4h", value: 2 },
      { time: "6h", value: 10 },
      { time: "8h", value: 16 },
      { time: "10h", value: 22 },
      { time: "12h", value: 25 },
      { time: "14h", value: 20 },
      { time: "16h", value: 15 },
      { time: "18h", value: 12 },
      { time: "20h", value: 8 },
      { time: "22h", value: 5 }
    ]
  },
  {
    id: "sess-007",
    deviceType: "laptop",
    deviceName: "ThinkPad X1 Carbon",
    browser: "Edge",
    browserVersion: "124.0.2478.80",
    os: "Windows 11",
    osVersion: "23H2",
    ip: "203.45.167.89",
    location: {
      city: "Tokyo",
      country: "Japan",
      countryCode: "JP",
      lat: 35.6762,
      lng: 139.6503
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isCurrentSession: false,
    status: "idle",
    riskLevel: "low",
    requestsCount: 1567,
    dataTransferred: 123,
    avgResponseTime: 156,
    failedAttempts: 1,
    twoFactorEnabled: true,
    vpnDetected: false,
    activityHistory: [
      { time: "0h", requests: 32 },
      { time: "2h", requests: 45 },
      { time: "4h", requests: 58 },
      { time: "6h", requests: 78 },
      { time: "8h", requests: 112 },
      { time: "10h", requests: 145 },
      { time: "12h", requests: 134 },
      { time: "14h", requests: 98 },
      { time: "16h", requests: 72 },
      { time: "18h", requests: 54 },
      { time: "20h", requests: 38 },
      { time: "22h", requests: 25 }
    ],
    bandwidthHistory: [
      { time: "0h", value: 8 },
      { time: "2h", value: 12 },
      { time: "4h", value: 18 },
      { time: "6h", value: 25 },
      { time: "8h", value: 35 },
      { time: "10h", value: 42 },
      { time: "12h", value: 38 },
      { time: "14h", value: 28 },
      { time: "16h", value: 20 },
      { time: "18h", value: 15 },
      { time: "20h", value: 10 },
      { time: "22h", value: 6 }
    ]
  },
  {
    id: "sess-008",
    deviceType: "desktop",
    deviceName: "iMac 27\"",
    browser: "Safari",
    browserVersion: "17.4.1",
    os: "macOS Ventura",
    osVersion: "13.6.6",
    ip: "78.194.56.123",
    location: {
      city: "London",
      country: "UK",
      countryCode: "GB",
      lat: 51.5074,
      lng: -0.1278
    },
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isCurrentSession: false,
    status: "idle",
    riskLevel: "medium",
    requestsCount: 4521,
    dataTransferred: 345,
    avgResponseTime: 89,
    failedAttempts: 2,
    twoFactorEnabled: false,
    vpnDetected: false,
    activityHistory: [
      { time: "0h", requests: 78 },
      { time: "2h", requests: 112 },
      { time: "4h", requests: 145 },
      { time: "6h", requests: 189 },
      { time: "8h", requests: 234 },
      { time: "10h", requests: 198 },
      { time: "12h", requests: 156 },
      { time: "14h", requests: 123 },
      { time: "16h", requests: 89 },
      { time: "18h", requests: 67 },
      { time: "20h", requests: 45 },
      { time: "22h", requests: 32 }
    ],
    bandwidthHistory: [
      { time: "0h", value: 22 },
      { time: "2h", value: 32 },
      { time: "4h", value: 45 },
      { time: "6h", value: 58 },
      { time: "8h", value: 68 },
      { time: "10h", value: 55 },
      { time: "12h", value: 42 },
      { time: "14h", value: 35 },
      { time: "16h", value: 25 },
      { time: "18h", value: 18 },
      { time: "20h", value: 12 },
      { time: "22h", value: 8 }
    ]
  },
  {
    id: "sess-009",
    deviceType: "mobile",
    deviceName: "Google Pixel 8 Pro",
    browser: "Chrome",
    browserVersion: "124.0.6367.113",
    os: "Android",
    osVersion: "14",
    ip: "45.89.234.167",
    location: {
      city: "New York",
      country: "USA",
      countryCode: "US",
      lat: 40.7128,
      lng: -74.006
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isCurrentSession: false,
    status: "active",
    riskLevel: "low",
    requestsCount: 756,
    dataTransferred: 52,
    avgResponseTime: 112,
    failedAttempts: 0,
    twoFactorEnabled: true,
    vpnDetected: false,
    activityHistory: [
      { time: "0h", requests: 18 },
      { time: "2h", requests: 25 },
      { time: "4h", requests: 12 },
      { time: "6h", requests: 38 },
      { time: "8h", requests: 52 },
      { time: "10h", requests: 68 },
      { time: "12h", requests: 78 },
      { time: "14h", requests: 62 },
      { time: "16h", requests: 48 },
      { time: "18h", requests: 35 },
      { time: "20h", requests: 22 },
      { time: "22h", requests: 15 }
    ],
    bandwidthHistory: [
      { time: "0h", value: 5 },
      { time: "2h", value: 7 },
      { time: "4h", value: 3 },
      { time: "6h", value: 11 },
      { time: "8h", value: 15 },
      { time: "10h", value: 20 },
      { time: "12h", value: 23 },
      { time: "14h", value: 18 },
      { time: "16h", value: 14 },
      { time: "18h", value: 10 },
      { time: "20h", value: 6 },
      { time: "22h", value: 4 }
    ]
  },
  {
    id: "sess-010",
    deviceType: "unknown",
    deviceName: "Serveur API Bot",
    browser: "curl",
    browserVersion: "8.7.1",
    os: "Linux",
    osVersion: "Ubuntu 22.04",
    ip: "159.65.234.89",
    location: {
      city: "Singapore",
      country: "Singapore",
      countryCode: "SG",
      lat: 1.3521,
      lng: 103.8198
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isCurrentSession: false,
    status: "suspicious",
    riskLevel: "high",
    requestsCount: 45678,
    dataTransferred: 2345,
    avgResponseTime: 34,
    failedAttempts: 156,
    twoFactorEnabled: false,
    vpnDetected: true,
    activityHistory: [
      { time: "0h", requests: 2345 },
      { time: "2h", requests: 3456 },
      { time: "4h", requests: 4567 },
      { time: "6h", requests: 5678 },
      { time: "8h", requests: 6789 },
      { time: "10h", requests: 5432 },
      { time: "12h", requests: 4321 },
      { time: "14h", requests: 3210 },
      { time: "16h", requests: 2109 },
      { time: "18h", requests: 1234 },
      { time: "20h", requests: 987 },
      { time: "22h", requests: 654 }
    ],
    bandwidthHistory: [
      { time: "0h", value: 234 },
      { time: "2h", value: 345 },
      { time: "4h", value: 456 },
      { time: "6h", value: 567 },
      { time: "8h", value: 678 },
      { time: "10h", value: 543 },
      { time: "12h", value: 432 },
      { time: "14h", value: 321 },
      { time: "16h", value: 210 },
      { time: "18h", value: 123 },
      { time: "20h", value: 98 },
      { time: "22h", value: 65 }
    ]
  },
  {
    id: "sess-011",
    deviceType: "tablet",
    deviceName: "Surface Pro 9",
    browser: "Edge",
    browserVersion: "124.0.2478.67",
    os: "Windows 11",
    osVersion: "23H2",
    ip: "156.78.234.56",
    location: {
      city: "Toronto",
      country: "Canada",
      countryCode: "CA",
      lat: 43.6532,
      lng: -79.3832
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isCurrentSession: false,
    status: "idle",
    riskLevel: "low",
    requestsCount: 678,
    dataTransferred: 56,
    avgResponseTime: 134,
    failedAttempts: 0,
    twoFactorEnabled: true,
    vpnDetected: false,
    activityHistory: [
      { time: "0h", requests: 12 },
      { time: "2h", requests: 18 },
      { time: "4h", requests: 8 },
      { time: "6h", requests: 25 },
      { time: "8h", requests: 42 },
      { time: "10h", requests: 58 },
      { time: "12h", requests: 65 },
      { time: "14h", requests: 52 },
      { time: "16h", requests: 38 },
      { time: "18h", requests: 28 },
      { time: "20h", requests: 18 },
      { time: "22h", requests: 12 }
    ],
    bandwidthHistory: [
      { time: "0h", value: 4 },
      { time: "2h", value: 6 },
      { time: "4h", value: 3 },
      { time: "6h", value: 9 },
      { time: "8h", value: 14 },
      { time: "10h", value: 19 },
      { time: "12h", value: 22 },
      { time: "14h", value: 17 },
      { time: "16h", value: 12 },
      { time: "18h", value: 9 },
      { time: "20h", value: 6 },
      { time: "22h", value: 4 }
    ]
  },
  {
    id: "sess-012",
    deviceType: "laptop",
    deviceName: "MacBook Air M3",
    browser: "Chrome",
    browserVersion: "124.0.6367.91",
    os: "macOS Sonoma",
    osVersion: "14.4",
    ip: "88.123.45.67",
    location: {
      city: "Sydney",
      country: "Australia",
      countryCode: "AU",
      lat: -33.8688,
      lng: 151.2093
    },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isCurrentSession: false,
    status: "idle",
    riskLevel: "medium",
    requestsCount: 2134,
    dataTransferred: 178,
    avgResponseTime: 189,
    failedAttempts: 4,
    twoFactorEnabled: false,
    vpnDetected: false,
    activityHistory: [
      { time: "0h", requests: 45 },
      { time: "2h", requests: 67 },
      { time: "4h", requests: 89 },
      { time: "6h", requests: 123 },
      { time: "8h", requests: 156 },
      { time: "10h", requests: 134 },
      { time: "12h", requests: 112 },
      { time: "14h", requests: 89 },
      { time: "16h", requests: 67 },
      { time: "18h", requests: 45 },
      { time: "20h", requests: 32 },
      { time: "22h", requests: 23 }
    ],
    bandwidthHistory: [
      { time: "0h", value: 12 },
      { time: "2h", value: 18 },
      { time: "4h", value: 25 },
      { time: "6h", value: 35 },
      { time: "8h", value: 45 },
      { time: "10h", value: 38 },
      { time: "12h", value: 32 },
      { time: "14h", value: 25 },
      { time: "16h", value: 18 },
      { time: "18h", value: 12 },
      { time: "20h", value: 8 },
      { time: "22h", value: 5 }
    ]
  }
]
