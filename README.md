# 7 Clouds · Futuristic Creative Studio Workspace ⚡

> **Next-Generation Employee Management, Attendance Tracking, Daily Deliverables & Workspace Web Application** built for creative agencies and high-velocity digital studios.

Inspired by the dark-first minimalist aesthetics of **Apple, Spotify, and Linear**, this application provides a complete, production-grade workspace combining biometric-style attendance logging, live task timers, advance leave notification workflows, daily work reporting, real-time push alerts, and executive monthly analytics into a single cohesive platform.

---

## 🌟 Visual Design System & Aesthetics

- **Dark-First Aesthetic**: Deep Midnight Black (`#080B14`) canvas with Navy surfaces (`#11182A`, `#171F35`).
- **Kinetic Accents**: Electric Blue (`#4568FF`), Indigo Violet (`#7855E8`), and Lavender (`#A48AFF`).
- **Precision Status Glows**: Mint Emerald (`#45D6A0`), Amber Gold (`#F5B85C`), and Crimson Rose (`#FF5757`).
- **Glassmorphic Depth**: Backdrop blurs (`16px`), micro-borders (`rgba(255,255,255,0.08)`), and subtle ambient glows.
- **Micro-Interactions**: Confetti celebration cannons on shift completion & milestone achievements, live digital chronometers, and reactive task progress sliders.

---

## 🚀 Key Modules & Capabilities

### 1. 🛡️ Role-Based Access Control (RBAC)
- **Studio Director & HR Admin (`admin`)**:
  - Full employee lifecycle (Onboard, edit profile, assign designations, toggle active/inactive).
  - HR Command Center with real-time presence indicators.
  - Approve or reject leave requests with mandatory review notes & quota auto-deduction.
  - Correct attendance records with immutable audit logging.
  - Create and reassign creative tasks across the team.
  - Publish studio-wide directives and broadcast announcements.
  - Export monthly compliance ledgers to **PDF** and **Excel / CSV**.
- **Creative Employees (`employee`)**:
  - Personalized creative dashboard with greeting, tasks due today, and leave quotas.
  - 1-Click attendance check-in & check-out with live session timer.
  - Interactive Daily Focus Task Board with integrated **Task Timers** (Play/Pause/Record hours).
  - Advance, same-day, and emergency time-off requests with automatic collision prevention.
  - Daily deliverable work reports categorized by discipline.
  - Personal monthly attendance summary and privacy-enforced data boundaries.

---

### 2. ⏱️ Attendance Management
- **Biometric-Grade Clocking**: Real-time check-in and check-out recording exact timestamps.
- **Live Hours Calculation**: Dynamic counter showing active shift hours down to tenths of an hour.
- **Configurable Cutoff Enforcement**: Automatic alert trigger past studio morning cutoff (`10:30 AM`). Employees are never marked absent before cutoff.
- **Location Selector**: HQ Studio Suite, Remote Work From Home (GPU/3D simulation), or Client Location (On-Set Shoot).
- **HR Audit Correction**: Modify attendance with mandatory audit reason logged to the immutable ledger.

---

### 3. 🎯 Task Management & Live Timer
- **Linear-Style Board**: Categorized into *Today's Focus*, *Upcoming*, *Overdue*, and *Completed*.
- **Integrated Task Timer**: Hit `Play` on any task to clock actual work time directly into the deliverable.
- **Priority Matrix**: `Low`, `Medium`, `High`, `Urgent`.
- **Granular Progress**: Real-time slider (0-100%) dynamically updating milestone status.
- **Asset Links**: Direct attachment and URL preview integration (Frame.io, Figma, Drive).

---

### 4. 🌴 Leave & Absence System
- **Leave Types**: Casual Leave, Sick Leave, Emergency Leave, Full Day, Half Day (Morning / Afternoon).
- **Collision Prevention**: Algorithmic validation preventing duplicate or overlapping dates.
- **Live Quotas**: Individual Casual, Sick, and Emergency balances automatically deducted upon HR signoff.
- **Segregated Reporting**: Only approved leaves count toward official attendance percentages in audits.

---

### 5. 📝 Daily Work Reports
- Daily deliverable submission tracking category (*Video Editing*, *Graphic Design*, *Motion & 3D*, *Digital Marketing*, *Photography*, *Content Creation*, *Strategy*), hours spent, and milestone links.
- Instant search and filtering by creative, discipline, date, and project.

---

### 6. 📊 Monthly Analytics & Export Engine
- Weighted presence rate, total billable hours, and task throughput calculations.
- **Print / PDF Generator**: Clean printable CSS layout formatted for board and client billing signoffs.
- **Excel / CSV Engine**: One-click RFC 4180 UTF-8 compliant data download.

---

### 7. 📅 Company Calendar & Directives
- Unified timeline overlaying studio holidays, approved team leaves, task deadlines, and announcements.
- HR Holiday management module to define studio downtime and creative sprints.

---

### 8. 🔔 Push Notifications & PWA
- In-app notification drop-down and centralized event audit trail.
- Browser **Push Notification API** and **Firebase Cloud Messaging (FCM)** background service worker.
- Installable Progressive Web App (PWA) with offline asset caching and network resilience.

---

## 👥 Pre-Loaded Studio Team (1-Click Demo Accounts)

Use the **1-Click Profile Switcher** located in the top-right header or login screen to immediately test the application under any persona:

| Persona | Name | Studio Designation | Department | Role | Default Email |
|---|---|---|---|---|---|
| 👑 **Admin** | **Elena Rostova** | Studio Director & HR Lead | Management / HR | `admin` | `elena@7clouds.studio` |
| 🎬 **Creative 1** | **Leo Vance** | Lead Video Editor | Creative Post-Production | `employee` | `leo@7clouds.studio` |
| 🎨 **Creative 2** | **Maya Chen** | Senior Graphic Designer | Visual Design | `employee` | `maya@7clouds.studio` |
| 🌀 **Creative 3** | **Kai Thorne** | Motion & 3D Artist | Motion & VFX | `employee` | `kai@7clouds.studio` |
| 📈 **Creative 4** | **Zara Al-Mansoor** | Digital Marketing Strategist | Growth & Marketing | `employee` | `zara@7clouds.studio` |
| 📸 **Creative 5** | **Liam O'Connor** | Senior Photographer & DP | Media Production | `employee` | `liam@7clouds.studio` |
| ✨ **Creative 6** | **Chloe Dubois** | Creative Content Producer | Content & Strategy | `employee` | `chloe@7clouds.studio` |

*Password in demo mode: any text (e.g. `password123`)*

---

## 🛠️ Technology Stack

- **Frontend Framework**: Angular 19 (Standalone Components, Signals & Reactive RxJS, OnPush optimization)
- **Styling & Theme**: Tailwind CSS v3 with custom theme tokens & CSS variables
- **Icons**: Custom Apple/Linear-inspired SVG icon system
- **Micro-Interactions**: Canvas Confetti
- **Backend & Cloud**:
  - Firebase Authentication
  - Cloud Firestore
  - Firebase Cloud Functions (v2 Scheduler & Firestore triggers)
  - Firebase Cloud Messaging (FCM) & Web Push
- **Offline / PWA**: Native Web App Manifest & Service Worker

---

## 💻 Local Development & Setup

### Prerequisites
- Node.js 18.x or 20.x
- npm 9.x or higher

### 1. Installation
Clone or navigate to the project directory and install dependencies:
```bash
cd "7 Clouds"
npm install
```

### 2. Run Local Development Server
```bash
npm start
```
Open your browser and navigate to:
```
http://localhost:4200
```

### 3. Build for Production
```bash
npm run build
```
The optimized, tree-shaken static bundle is output to `dist/seven-clouds-app/browser`.

---

## 🔥 Firebase Setup Guide

To connect the application to your live Firebase project instead of the default local reactive simulation:

### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it `seven-clouds-studio` (or your agency name).
3. Enable **Google Analytics** (optional).

### 2. Enable Authentication
1. Navigate to **Build > Authentication > Sign-in method**.
2. Enable **Email/Password**.

### 3. Create Cloud Firestore Database
1. Navigate to **Build > Firestore Database > Create database**.
2. Select **Production mode** and pick your closest regional server.
3. Deploy the included security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 4. Configure Web App Credentials
1. In Firebase Console Project Settings, under **Your apps**, click the `</>` (Web) icon.
2. Copy your configuration credentials into `src/environments/environment.ts` and `src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     firebase: {
       apiKey: "YOUR_FIREBASE_API_KEY",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID",
       measurementId: "YOUR_MEASUREMENT_ID"
     },
     fcmVapidKey: "YOUR_FCM_WEB_PUSH_VAPID_KEY",
     useFirebaseBackend: true
   };
   ```

### 5. Deploy Cloud Functions
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### 6. Deploy to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

---

## 🔒 Security Architecture

1. **Role-Based Guards**:
   - `authGuard`: Guarantees only authenticated sessions can access the internal studio suite.
   - `adminGuard`: Restricts HR Command Center, Employee Management, Settings, and Audits to users with `role: 'admin'`.
2. **Firestore Security Rules**:
   - Implements document-level ownership validation (`request.auth.uid == resource.data.userId`).
   - Employees are explicitly prohibited from modifying `role`, `status`, `leaveBalances`, or another creative's records.
   - Audit logs are write-only and tamper-proof (`allow update, delete: if false`).
3. **No Server Secrets in Client**:
   - Push dispatch and scheduled cutoff checks run in isolated Node 20 Cloud Functions using `firebase-admin`.

---

## 📱 PWA & Mobile Installation

- On **macOS / Windows / Chrome**: Click the **Install Studio App** button in the sidebar or address bar.
- On **iOS Safari**: Tap the Share icon > **Add to Home Screen**.
- On **Android**: Tap the menu > **Install app**.

The workspace launches in full-screen standalone mode with native app performance.

---

## 📄 License & Studio Copyright

© 2026 7 Clouds Creative Studio. All rights reserved. Designed for elite digital and creative workspaces.
