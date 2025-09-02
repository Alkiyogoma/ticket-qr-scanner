# Ticket Scanner QR Code Verification

Progressive Web App for QR code scanning and ticket verification using Vue and Nuxt.js. 
This app will be installable like a native app and integrate with your backend API.

🚀 Complete PWA Solution
Key Features Implemented:

  - QR Code Scanning - Real-time camera scanning with **jsqr** library
  - Manual Entry - Backup option for manual ticket ID input
  - CORS-Ready Laravel Integration - Proper cross-origin setup for your API
  - Enhanced Error Handling - Specific error messages for different scenarios
  - PWA Capabilities - Installable app with offline support
  - Responsive Design - Works perfectly on mobile and desktop
  - Scan History - Tracks all verification attempts with status
  - Mark as Used - Additional endpoint to mark tickets as use
## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn

# npm
npm install

# pnpm
pnpm install --shamefully-hoist
```

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```
## Backend Response

```
{
  "success": true,
  "message": "Ticket verified successfully",
  "ticket": {
    "id": 4,
    "ticket_number": "270893",
    "name": "Albogast Kiyogoma",
    "ticket_type": "Free Admission",
    "status": "active",
    "last_scanned_at": "2025-09-02T08:24:15.000000Z",
    "event": {
      "id": 1,
      "title": "School Opening Day at Genesis Schools",
      "start_date": "2025-09-02T10:30:00.000000Z",
      "end_date": "2025-10-31T10:29:00.000000Z",
      "location": "Genesis Schools",
      "status": null
    }
  }
}
```
## Frontend preview

![](https://github.com/Alkiyogoma/genesis-event/blob/main/public/camera.jpg)
![](https://github.com/Alkiyogoma/genesis-event/blob/main/public/result.jpg)

Checkout the [deployment documentation](https://nuxt.com/docs/getting-started/deployment#presets) for more information.
