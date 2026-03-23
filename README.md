# Nova — Photo & Video Social App

A full-stack, production-ready social media app built with **React + Vite** and **Firebase**.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Auth | Firebase Authentication (Email + Google) |
| Database | Cloud Firestore (real-time) |
| Storage | Firebase Storage (photos, videos, avatars) |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Hosting | Firebase Hosting |
| Styling | Pure CSS with CSS variables (zero UI lib) |

---

## Features

- ✦ Email & Google authentication
- 📸 Photo + video post upload with progress bar (up to 10 files per post)
- ❤️ Likes, 💬 comments, 🔖 saves — all real-time via Firestore listeners
- 👥 Follow / unfollow users with live follower counts
- 📖 Stories (24h expiry)
- 🔍 User search
- 🔔 In-app notifications + FCM push notifications (foreground & background)
- 💬 Direct messaging between users
- 🖼️ Explore grid sorted by top liked posts
- 👤 Profile page with avatar upload, bio, posts/followers/following
- ⚙️ Settings: change password, notification toggles, logout
- 📱 Responsive layout (desktop → tablet → mobile)
- 🔒 Firestore & Storage security rules

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Firebase project

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `nova-app`
3. Enable **Google Analytics** (optional)

### 3. Enable Firebase services

In your Firebase Console:

| Service | How to enable |
|---|---|
| **Authentication** | Build → Authentication → Get started → Enable Email/Password + Google |
| **Firestore** | Build → Firestore Database → Create database → Start in **test mode** (you'll deploy rules later) |
| **Storage** | Build → Storage → Get started → Start in test mode |
| **Cloud Messaging** | Project Settings → Cloud Messaging → Generate a Web Push certificate (VAPID key) |

### 4. Add your Firebase config

1. Project Settings (⚙️) → General → Your apps → Add app → Web
2. Copy the `firebaseConfig` object
3. Open `src/firebase/config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "nova-app-xxxxx.firebaseapp.com",
  projectId: "nova-app-xxxxx",
  storageBucket: "nova-app-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
}
```

4. Also paste the **same config** into `public/firebase-messaging-sw.js`

5. Paste your **VAPID key** into `src/firebase/messaging.js`:

```js
const VAPID_KEY = 'BNs8...' // from Firebase Console → Cloud Messaging → Web Push certificates
```

### 5. Run the app

```bash
npm run dev
```

Open http://localhost:3000

---

## Deploy to Firebase Hosting

```bash
# Install Firebase CLI (once)
npm install -g firebase-tools

# Login
firebase login

# Init (select Hosting, Firestore, Storage — use existing files)
firebase init

# Build
npm run build

# Deploy everything
firebase deploy
```

This deploys:
- The React app to Firebase Hosting
- Firestore security rules
- Storage security rules
- Firestore indexes

---

## Project Structure

```
nova-app/
├── public/
│   └── firebase-messaging-sw.js   ← FCM background push handler
├── src/
│   ├── firebase/
│   │   ├── config.js               ← Firebase init (paste your keys here)
│   │   ├── auth.js                 ← Login, register, Google, password reset
│   │   ├── firestore.js            ← All Firestore CRUD + real-time listeners
│   │   ├── storage.js              ← File upload helpers (posts, avatars, stories)
│   │   └── messaging.js            ← FCM push notification setup
│   ├── context/
│   │   └── AuthContext.jsx         ← Global auth state + profile
│   ├── components/
│   │   ├── AppLayout.jsx           ← Sidebar + outlet wrapper
│   │   ├── IconNav.jsx             ← Left icon navigation bar
│   │   ├── LeftPanel.jsx           ← Stories, reels, new post button
│   │   ├── RightPanel.jsx          ← Search, trending tags, stats
│   │   ├── PostCard.jsx            ← Single post with like/save/comment
│   │   ├── NewPostModal.jsx        ← Upload modal (drag-drop, multi-file)
│   │   └── LoadingScreen.jsx       ← Full-page loading spinner
│   ├── pages/
│   │   ├── HomePage.jsx            ← Real-time feed (For You / Following tabs)
│   │   ├── ExplorePage.jsx         ← Grid sorted by top likes
│   │   ├── ProfilePage.jsx         ← User profile + avatar upload + edit
│   │   ├── PostPage.jsx            ← Single post + live comments panel
│   │   ├── NotificationsPage.jsx   ← Notifications list
│   │   ├── MessagesPage.jsx        ← DM conversations + chat
│   │   ├── SavedPage.jsx           ← Bookmarked posts grid
│   │   ├── SettingsPage.jsx        ← Password change, notifications, logout
│   │   ├── LoginPage.jsx           ← Email + Google login
│   │   └── RegisterPage.jsx        ← Sign up form
│   ├── styles/
│   │   └── globals.css             ← Dark theme CSS variables + utilities
│   ├── App.jsx                     ← Routes (public + private)
│   └── main.jsx                    ← React root + providers
├── firestore.rules                 ← Security rules for Firestore
├── firestore.indexes.json          ← Composite indexes
├── storage.rules                   ← Security rules for Storage
├── firebase.json                   ← Hosting + deploy config
└── vite.config.js
```

---

## Firestore Data Model

```
users/{uid}
  ├── uid, email, username, displayName
  ├── avatarUrl, bio, website
  ├── followersCount, followingCount, postsCount
  ├── isVerified, fcmToken
  ├── saved/{postId}
  └── notifications/{notifId}

follows/{followerId_targetId}
  └── followerId, followingId, createdAt

posts/{postId}
  ├── authorId, authorName, authorAvatar, authorVerified
  ├── mediaUrls[], mediaPaths[], mediaType
  ├── caption, location, tags[]
  ├── likesCount, commentsCount, likedBy[]
  ├── createdAt
  └── comments/{commentId}
        └── authorId, authorName, text, createdAt

stories/{storyId}
  └── authorId, mediaUrl, expiresAt, viewedBy[]

conversations/{uid1_uid2}
  ├── participants[], lastMessage, lastMessageAt
  └── messages/{msgId}
        └── senderId, senderName, text, createdAt
```

---

## Environment Variables (optional)

If you prefer not to commit your keys to git, create a `.env` file:

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Then update `src/firebase/config.js` to use `import.meta.env.VITE_FIREBASE_API_KEY` etc.
Add `.env` to your `.gitignore`.

---

## Common Issues

| Problem | Fix |
|---|---|
| Google login popup blocked | Allow popups for localhost in your browser |
| Storage CORS errors | Run `gsutil cors set cors.json gs://YOUR_BUCKET` |
| FCM not working | Make sure VAPID key is correct and browser allows notifications |
| Firestore permission denied | Deploy `firestore.rules` via `firebase deploy --only firestore:rules` |
| Missing indexes error | Deploy `firestore.indexes.json` or click the link in the error |

---

Built with ✦ by Nova
