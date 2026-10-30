# Smart Parking Reservation System

A React and Firebase based Smart Parking Reservation System.

The system provides a modern blue and white interface inspired by the supplied UI reference.

## Technologies

- React.js
- Vite
- Firebase Authentication
- Firebase Firestore
- React Router
- Lucide React Icons
- CSS

---

# Main Features

## User Features

Users can:

- Register an account
- Login
- View parking locations
- Search parking locations
- View parking slots
- Check slot availability
- Select a parking slot
- Select reservation date
- Select start time
- Select end time
- Make a reservation
- View reservations
- Cancel reservations

---

# Admin Features

Administrators can:

- Login
- View dashboard statistics
- Manage parking locations
- Add parking locations
- Delete parking locations
- Manage parking slots
- Add parking slots
- Delete parking slots
- View reservations
- Delete reservations

---

# Firebase Setup

## Step 1

Create a Firebase project.

Go to:

Firebase Console

Create a new project.

---

## Step 2

Enable Authentication.

Firebase Console:

Authentication
→ Sign-in method
→ Email/Password
→ Enable

---

## Step 3

Create Firestore Database.

Firebase Console:

Firestore Database
→ Create database

---

## Step 4

Create a Web App.

Firebase:

Project Settings
→ Your Apps
→ Web App

Copy the Firebase configuration.

Open:

src/firebase.js

Replace:

YOUR_FIREBASE_API_KEY

YOUR_PROJECT

YOUR_PROJECT_ID

YOUR_MESSAGING_SENDER_ID

YOUR_APP_ID

with your Firebase configuration.

---

# Important Firebase User Structure

When a user registers, the system creates:

users/{Firebase Auth UID}

Example:

users/
    abc123xyz/

Inside the document:

{
    name: "John",
    email: "john@gmail.com",
    role: "user"
}

The document ID must be the Firebase Authentication UID.

---

# Creating an Admin

First create a normal account using Register.

Then open:

Firebase Console
→ Firestore Database
→ users

Find the user's Firebase Authentication UID.

The document should look like:

users
  └── USER_AUTH_UID

Add:

role: "admin"

Example:

{
    name: "Admin",
    email: "admin@gmail.com",
    role: "admin"
}

Now login using that account.

The system will open:

/admin

---

# Collections

The application uses these Firestore collections:

users

locations

slots

reservations

---

# Example Location

locations:

{
    name: "Colombo City Parking",
    address: "Colombo 03",
    availableSlots: 25
}

---

# Example Slot

slots:

{
    locationId: "LOCATION_ID",
    slotNumber: "A01",
    type: "Standard",
    price: 200,
    status: "available"
}

---

# Example Reservation

reservations:

{
    userId: "USER_ID",
    locationId: "LOCATION_ID",
    slotId: "SLOT_ID",
    locationName: "Colombo City Parking",
    slotNumber: "A01",
    date: "2026-09-25",
    startTime: "08:00",
    endTime: "10:00",
    status: "confirmed",
    paymentStatus: "mock_paid"
}

---

# Install Dependencies

Open the project folder in VS Code terminal.

Run:

npm install

---

# Run the Project

Run:

npm run dev

Then open the Vite URL shown in the terminal.

Usually:

http://localhost:5173

---

# Build Project

For production build:

npm run build

---

# Preview Production Build

npm run preview

---

# Firestore Rules

Copy the content from:

firestore.rules

to:

Firebase Console
→ Firestore Database
→ Rules

Then publish the rules.

---

# Project Structure

Smart-Parking-Blue-React/

├── package.json

├── index.html

├── firestore.rules

├── README.md

│

└── src/

    ├── firebase.js

    ├── main.jsx

    └── style.css

---

# Project UI

The interface uses:

- Blue
- White
- Light blue
- Navy

The design includes:

- Rounded cards
- Modern buttons
- Large hero section
- Responsive navigation
- Parking visual
- Mobile responsive layout
- Dashboard cards
- Reservation cards

---

# Important Note

The payment section is currently a mock payment/confirmation process.

A real payment gateway can be integrated later.

For the final version, transaction-based reservation locking should be added to prevent two users from reserving the same parking slot at the same time.


## Member 2 — Reservation & Payment Module

The user dashboard includes the Member 2 workflow:

- Select an available parking bay from the existing slot layout.
- Choose a reservation date, start time, and end time. Past dates, invalid time ranges, and past start times for today are rejected.
- Calculate the estimated fee from the selected location's hourly price.
- Choose the simulated card payment or pay-at-location option. This project does not collect card details or charge real money.
- Save a reservation with a unique reference, payment status, user ID, location, slot, time, and total.
- View the signed-in user's reservations and cancel a confirmed reservation.
- Use a Firestore transaction to check the current slot state and write the reservation plus slot lock together. This prevents two concurrent bookings from successfully locking the same available slot.

### Important implementation notes

1. Bookings require real documents in the Firestore `locations` and `slots` collections. Fallback/demo slots are display-only and cannot be booked.
2. The current `firestore.rules` model reserves a slot exclusively until its reservation is cancelled. It does not yet support reusing the same slot for non-overlapping date/time windows. That requires a date/time-aware reservation schema and coordinated rule updates.
3. Publish the repository's `firestore.rules` in Firebase Console for the transaction and cancellation flow to work. Do not loosen the rules to make errors disappear.
4. Payment is simulated for coursework/demo purposes only. A real payment gateway must be integrated and verified server-side before using real payments.

## Member 2 — Reservation, payment demo, booking history

- A booking is created in the Firestore `reservations` collection in the same transaction that locks the corresponding `slots/{slotId}` document.
- The driver can see their bookings in **My Reservations**, refresh history, cancel a confirmed reservation, and extend the same-day end time.
- Firestore rules are in `firestore.rules`. Publish those rules in Firebase Console before testing.
- Payment is simulated for assignment/demo use only. No real card details or real payment processing are implemented.
- Generated fallback/sample parking bays are deliberately not bookable; create real documents in Firestore's `slots` collection with `locationId`, `slotNumber`, `status: "available"`, and optionally `type`/`price`.
