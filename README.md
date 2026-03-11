# 📦 Spare Parts Catalogue - React Native App

### A production-grade mobile app for browsing, searching and enquiring about spare parts

[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![NativeWind](https://img.shields.io/badge/NativeWind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://www.nativewind.dev)
[![Zustand](https://img.shields.io/badge/Zustand-v5-FF6B35?style=for-the-badge)](https://zustand-demo.pmnd.rs)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge)](https://tanstack.com/query)

> A fully-featured, type-safe React Native app built with Expo SDK 54 and Expo Router. Designed for field teams and dealers to browse a live spare parts catalogue, raise enquiries, and manage their account - with enterprise-grade security features baked in.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Screens & Navigation](#-screens--navigation)
- [Security Features](#-security-features)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Build & Deploy](#-build--deploy)
- [Related Project](#-related-project)

---

## ✨ Features

### 📱 Core App
- **3-slide onboarding carousel** with pagination dots and smooth snap scrolling
- **Email + password login** with show/hide toggle and client-side validation
- **Forgot password** flow with reset via email
- **Dashboard** - 4-card grid for quick access to all key features
- **Product search** - keyword-based spare parts search with results
- **Product detail** - full part info with image viewer
- **Favorites** - save and manage preferred parts
- **Enquiry system** - raise product enquiries and track history
- **User profile** - view and manage account details

### 🔄 Smart Data Layer
- **Silent token refresh** - Axios interceptor silently renews expired JWTs without logging the user out
- **Zustand auth store** - persisted to AsyncStorage, rehydrated on app launch
- **TanStack Query** - caching, background refetch and stale-time configuration per query
- **Offline detection** - `NoInternet` screen shown instantly on connection loss, TanStack Query `onlineManager` synced with NetInfo

### 🔒 Security Features (see full section below)
- Screenshot and screen recording **blocked on Android**
- Screen recording **blocked on iOS** (Apple policy prevents blocking screenshots)
- Custom **native Expo plugins** for Android `FLAG_SECURE` and iOS secure layer
- Portrait orientation **locked** to prevent layout exploits

### 🚀 OTA Updates
- **`UpdateManager`** component checks for Expo OTA updates every hour
- Animated modal with progress bar when an update is available
- One-tap download and apply - app reloads automatically
- Skipped safely in development mode

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Framework** | React Native 0.81 + Expo SDK 54 | Cross-platform mobile |
| **Language** | TypeScript 5 | Full type safety |
| **Routing** | Expo Router v6 | File-based navigation |
| **Styling** | NativeWind v4 (Tailwind CSS) | Utility-first styling |
| **State** | Zustand v5 | Global auth state with persistence |
| **Data Fetching** | TanStack Query v5 | Server state, caching, background sync |
| **HTTP** | Axios | API calls + JWT interceptor |
| **Storage** | AsyncStorage | Token + auth state persistence |
| **Updates** | expo-updates | OTA update delivery |
| **Security** | expo-screen-capture | Screenshot/recording prevention |
| **Network** | @react-native-community/netinfo | Online/offline detection |
| **Images** | expo-image + react-native-image-viewing | Optimised image rendering + viewer |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    App Entry (_layout.tsx)                    │
│                                                              │
│  SecureScreen → QueryClientProvider → AuthProvider → Stack  │
│  (screen protection)  (TanStack Q)    (auth state)  (nav)   │
└────────────────────────────┬────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
   Public Screens      ProtectedRoute      UpdateManager
   /index (onboarding) checks Zustand      checks for OTA
   /login             store on mount       every 1 hour
   /forgot-password   → redirects if
                        not authenticated
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
         Screen Component          Custom Hook
         (UI only)                 (TanStack Query)
                                         │
                                         ▼
                                  Service Function
                                  (Axios typed call)
                                         │
                                         ▼
                                  axiosInstance
                              (base URL + JWT header
                               + silent refresh on 401)
                                         │
                                         ▼
                               REST API Backend
```

**Key patterns:**
- **File-based routing** via Expo Router - screens are just files in `/app`
- **Zustand store** initialized from AsyncStorage on first load (`onRehydrateStorage`)
- **Service layer** - typed Axios functions, never called directly from components
- **Silent refresh** - 401 response triggers token refresh, original request retried automatically

---

## 📁 Project Structure

```
app/                          # Expo Router screens (file = route)
├── _layout.tsx               # Root layout - providers, security wrappers, nav stack
├── index.tsx                 # Onboarding (3-slide carousel)
├── login.tsx                 # Email + password login
├── forgot-password.tsx       # Password reset flow
├── dashboard.tsx             # Home - 4-card grid (protected)
├── search.tsx                # Keyword product search (protected)
├── seach-limited.tsx         # Limited/guest search view
├── product.tsx               # Product detail + image viewer (protected)
├── favorites.tsx             # Saved parts list (protected)
├── enquiries.tsx             # Enquiry history (protected)
├── enquiry-detail.tsx        # Single enquiry detail (protected)
├── profile.tsx               # User profile (protected)
└── help.tsx                  # Help & support (protected)

src/
├── components/
│   ├── AuthProvider.tsx       # Auth state initializer on app start
│   ├── ProtectedRoute.tsx     # Route guard - redirects to /login if not authed
│   ├── Button.tsx             # Reusable button with variants
│   ├── EnquiryBottomSheet.tsx # Bottom sheet for raising enquiries
│   ├── NoInternet.tsx         # Full-screen offline indicator
│   ├── UpdateManager.tsx      # OTA update checker + animated modal
│   ├── SecureScreen.tsx       # Blocks screenshots via expo-screen-capture
│   ├── SecureScreenPass.tsx   # Secondary screen protection layer
│   ├── IOSScreenProtection.tsx
│   ├── CompleteIOSProtection.tsx
│   └── icons/                 # SVG icon components (Search, Save, Profile, etc.)
│
├── hooks/                     # TanStack Query custom hooks
│   ├── useAuth.ts             # Login, logout, profile fetch mutations
│   ├── useProducts.ts         # Product listing + search
│   ├── useFavorites.ts        # Add/remove/list favorites
│   ├── useEnquiries.ts        # Enquiry list + raise new
│   └── useForgotPassword.ts   # Password reset flow
│
├── services/                  # Typed Axios API call functions
│   ├── api.ts                 # Axios instance + JWT interceptor + silent refresh
│   ├── userService.ts         # Login, logout, profile
│   ├── productService.ts      # Product search + detail
│   ├── favoriteService.ts     # Favorites CRUD
│   ├── enquiryService.ts      # Enquiry list + create
│   └── passwordResetService.ts
│
├── store/
│   └── authStore.ts           # Zustand store - user, token, refreshToken (persisted)
│
├── types/                     # TypeScript interfaces
│   ├── auth.ts
│   ├── product.ts
│   ├── enquiry.ts
│   ├── favorite.ts
│   └── index.ts
│
├── constants/
│   ├── config.ts              # API base URL
│   ├── onboarding.ts          # Onboarding slide data
│   ├── color.ts               # Brand color tokens
│   └── version.ts             # App version constant
│
└── plugins/
    ├── withSecureFlag.js      # Custom Expo plugin - Android FLAG_SECURE
    └── withSecureFlagiOS.js   # Custom Expo plugin - iOS secure layer
```

---

## 📲 Screens & Navigation

| Screen | Route | Auth | Description |
|--------|-------|------|-------------|
| Onboarding | `/` | ❌ | 3-slide intro carousel with CTA |
| Login | `/login` | ❌ | Email + password, forgot password link |
| Forgot Password | `/forgot-password` | ❌ | Password reset via email |
| Dashboard | `/dashboard` | 🔒 | 4-card home grid |
| Search | `/search` | 🔒 | Keyword spare parts search |
| Product Detail | `/product` | 🔒 | Full part info + image viewer |
| Favorites | `/favorites` | 🔒 | Saved parts list |
| Enquiries | `/enquiries` | 🔒 | Enquiry history |
| Enquiry Detail | `/enquiry-detail` | 🔒 | Single enquiry view |
| Profile | `/profile` | 🔒 | User account details |
| Help & Support | `/help` | 🔒 | Support information |

> 🔒 = Protected by `ProtectedRoute` component - unauthenticated users are redirected to `/login`

---

## 🔒 Security Features

This app implements multiple layers of screen protection to prevent data leaks through screenshots or screen recording:

```
┌──────────────────────────────────────────────────────────┐
│                   Security Stack                          │
│                                                          │
│  1. SecureScreen          expo-screen-capture            │
│     └─ preventScreenCaptureAsync() on mount              │
│                                                          │
│  2. SecureScreenPass      Secondary protection layer     │
│                                                          │
│  3. CompleteIOSProtection iOS-specific secure view       │
│                                                          │
│  4. IOSScreenProtection   Additional iOS layer           │
│                                                          │
│  5. withSecureFlag.js     Native plugin → Android        │
│     └─ Sets FLAG_SECURE   WindowManager flag             │
│                                                          │
│  6. withSecureFlagiOS.js  Native plugin → iOS            │
│     └─ Secure UITextField layer                          │
│                                                          │
│  7. Portrait lock         ScreenOrientation.lockAsync()  │
└──────────────────────────────────────────────────────────┘
```

| Platform | Screenshots | Screen Recording |
|---|---|---|
| **Android** | ✅ Blocked | ✅ Blocked |
| **iOS** | ⚠️ Not blockable (Apple policy) | ✅ Blocked |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Expo CLI - `npm install -g expo-cli`
- Expo Go app on device or Android/iOS emulator

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/6ixline/react-native-parts-catalogue.git
cd react-native-parts-catalogue

# 2. Install dependencies
npm install

# 3. Start the Expo development server
npx expo start
```

Then press `a` for Android emulator or `i` for iOS simulator, or scan the QR code with Expo Go.

---

## 🔧 Environment Variables

Update `src/constants/config.ts` with your API URL:

```ts
export const BASE_URL = "https://your-api-domain.com";
export const API_BASE_URL = 'https://your-api-domain.com/api';
```

---

## 📦 Build & Deploy

```bash
# Build for Android (APK preview)
eas build --platform android --profile preview

# Build for iOS
eas build --platform ios --profile preview

# OTA update (no store submission needed)
eas update --branch production --message "your update message"
```

---

## 🔗 Related Project

This app connects to the **Product Catalog REST API** for all data:

> 🔧 **[nodejs-express-rest-api](https://github.com/6ixline/nodejs-express-rest-api)** - Node.js + Express 5 + MySQL backend with multi-role JWT auth, product catalog, enquiry system and bulk Excel import.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ using React Native & Expo

**[⬆ Back to top](#-spare-parts-catalogue--react-native-app)**

</div>