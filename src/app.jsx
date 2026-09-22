import React, { useState } from "react";

const locations = [
  {
    id: 1,
    name: "Colombo City Parking",
    address: "Colombo 03",
    slots: 24,
    available: 8,
    price: 150,
  },
  {
    id: 2,
    name: "Kandy Central Parking",
    address: "Kandy City",
    slots: 30,
    available: 12,
    price: 120,
  },
  {
    id: 3,
    name: "Galle Fort Parking",
    address: "Galle Fort",
    slots: 18,
    available: 5,
    price: 100,
  },
];

function app() {
  const [page, setPage] = useState("home");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reservations, setReservations] = useState([]);

  // Open parking location
  const openReservation = (location) => {
    setSelectedLocation(location);
    setPage("slots");
  };

  // Select parking slot
  const reserve = (slot) => {
    setSelectedSlot(slot);
    setPage("reserve");
  };

  // Confirm reservation
  const confirmReservation = () => {
    if (!selectedLocation || !selectedSlot) {
      return;
    }

    const reservation = {
      id: Date.now(),
      location: selectedLocation.name,
      slot: selectedSlot,
      date: new Date().toLocaleDateString(),
    };

    setReservations((oldReservations) => [
      reservation,
      ...oldReservations,
    ]);

    setSelectedLocation(null);
    setSelectedSlot(null);

    setPage("reservations");
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">

        <div
          className="brand"
          onClick={() => setPage("home")}
        >
          <div className="brand-icon">
            P
          </div>

          <div>
            <h2>SmartPark</h2>
            <span>Parking Reservation System</span>
          </div>
        </div>

        <nav>

          <button
            className={page === "home" ? "active" : ""}
            onClick={() => setPage("home")}
          >
            Home
          </button>

          <button
            onClick={() => setPage("locations")}
          >
            Parking Locations
          </button>

          <button
            onClick={() => setPage("reservations")}
          >
            My Reservations
          </button>

          <button
            className="login-btn"
            onClick={() => setPage("login")}
          >
            Login
          </button>

        </nav>

      </header>


      {/*  HOME PAGE  */}

      {page === "home" && (
        <>

          <section className="hero">

            <div className="hero-content">

              <div className="eyebrow">
                SMART PARKING SOLUTION
              </div>

              <h1>
                Find. Reserve.
                <br />
                <span>Park with confidence.</span>
              </h1>

              <p>
                Find available parking spaces, reserve your
                slot before arriving, and manage your parking
                easily from one place.
              </p>

              <div className="hero-actions">

                <button
                  className="primary-btn"
                  onClick={() => setPage("locations")}
                >
                  Find Parking →
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => setPage("reservations")}
                >
                  My Reservations
                </button>

              </div>


              {/* HERO STATISTICS */}

              <div className="hero-stats">

                <div>
                  <strong>72+</strong>
                  <span>Parking Slots</span>
                </div>

                <div>
                  <strong>3</strong>
                  <span>Locations</span>
                </div>

                <div>
                  <strong>24/7</strong>
                  <span>Availability</span>
                </div>

              </div>

            </div>


            {/* PARKING VISUAL */}

            <div className="hero-visual">

              <div className="parking-card">

                <div className="map-top">

                  <span>
                    Parking Availability
                  </span>

                  <span className="live">
                    <i></i>
                    LIVE
                  </span>

                </div>


                <div className="parking-map">

                  <div className="road road-one"></div>
                  <div className="road road-two"></div>

                  {[
                    "A1",
                    "A2",
                    "A3",
                    "B1",
                    "B2",
                    "B3",
                    "C1",
                    "C2",
                    "C3",
                  ].map((slot, index) => (

                    <div
                      key={slot}
                      className={`parking-slot ${
                        index % 3 === 0
                          ? "busy"
                          : ""
                      }`}
                    >
                      {slot}
                    </div>

                  ))}

                </div>


                <div className="map-footer">

                  <span>
                    <b className="dot available-dot"></b>
                    Available
                  </span>

                  <span>
                    <b className="dot busy-dot"></b>
                    Occupied
                  </span>

                </div>

              </div>

            </div>

          </section>


          {/* FEATURES */}

          <section className="features">

            <div className="section-label">
              WHY SMARTPARK
            </div>

            <h2>
              A simpler way to park
            </h2>

            <p className="section-text">
              Everything you need to find and reserve
              a parking space.
            </p>


            <div className="feature-grid">

              <Feature
                icon="⌖"
                title="Find Nearby Parking"
                text="Search available parking locations and view real-time slot availability."
              />

              <Feature
                icon="✓"
                title="Reserve in Advance"
                text="Select your preferred slot and reserve it before you arrive."
              />

              <Feature
                icon="◷"
                title="Save Your Time"
                text="Reduce time spent driving around looking for an available space."
              />

            </div>

          </section>

        </>
      )}


      {/* ================= LOCATIONS ================= */}

      {page === "locations" && (

        <main className="page">

          <PageTitle
            title="Parking Locations"
            text="Choose a location and view available parking slots."
          />

          <div className="location-grid">

            {locations.map((location) => (

              <LocationCard
                key={location.id}
                location={location}
                onReserve={() =>
                  openReservation(location)
                }
              />

            ))}

          </div>

        </main>

      )}


      {/*  PARKING SLOTS  */}

      {page === "slots" &&
        selectedLocation && (

          <main className="page">

            <button
              className="back-btn"
              onClick={() => setPage("locations")}
            >
              ← Back to locations
            </button>


            <PageTitle
              title={selectedLocation.name}
              text={`${selectedLocation.address} • Rs. ${selectedLocation.price} per hour`}
            />


            <div className="slots-grid">

              {Array.from(
                {
                  length: selectedLocation.slots,
                },
                (_, index) => {

                  const slot =
                    `P-${String(index + 1).padStart(
                      2,
                      "0"
                    )}`;

                  const occupied =
                    index % 5 === 0;

                  return (

                    <button
                      key={slot}
                      disabled={occupied}
                      className={`slot ${
                        occupied
                          ? "occupied"
                          : "available-slot"
                      }`}
                      onClick={() =>
                        reserve(slot)
                      }
                    >

                      <span>
                        ▣
                      </span>

                      {slot}

                      <small>
                        {occupied
                          ? "Occupied"
                          : "Available"}
                      </small>

                    </button>

                  );

                }
              )}

            </div>

          </main>

        )}


      {/*  RESERVATION  */}

      {page === "reserve" &&
        selectedLocation &&
        selectedSlot && (

          <main className="page narrow">

            <button
              className="back-btn"
              onClick={() => setPage("slots")}
            >
              ← Back to slots
            </button>


            <div className="reservation-panel">

              <div className="section-label">
                RESERVATION
              </div>

              <h1>
                Reserve your parking slot
              </h1>


              <div className="summary">

                <div>
                  <span>Location</span>
                  <strong>
                    {selectedLocation.name}
                  </strong>
                </div>

                <div>
                  <span>Slot</span>
                  <strong>
                    {selectedSlot}
                  </strong>
                </div>

                <div>
                  <span>Price</span>
                  <strong>
                    Rs. {selectedLocation.price}/hour
                  </strong>
                </div>

              </div>


              <label>
                Date

                <input
                  type="date"
                  defaultValue={
                    new Date()
                      .toISOString()
                      .slice(0, 10)
                  }
                />

              </label>


              <div className="time-row">

                <label>
                  Start Time

                  <input
                    type="time"
                    defaultValue="09:00"
                  />

                </label>


                <label>
                  End Time

                  <input
                    type="time"
                    defaultValue="10:00"
                  />

                </label>

              </div>


              <button
                className="primary-btn full"
                onClick={confirmReservation}
              >
                Confirm Reservation
              </button>

            </div>

          </main>

        )}


      {/*  MY RESERVATIONS */}

      {page === "reservations" && (

        <main className="page">

          <PageTitle
            title="My Reservations"
            text="View your current parking reservations."
          />


          {reservations.length === 0 ? (

            <div className="empty">

              <div>
                ▣
              </div>

              <h3>
                No reservations yet
              </h3>

              <p>
                Find a parking location and
                reserve a slot.
              </p>

              <button
                className="primary-btn"
                onClick={() =>
                  setPage("locations")
                }
              >
                Find Parking
              </button>

            </div>

          ) : (

            <div className="reservation-list">

              {reservations.map((reservation) => (

                <div
                  className="reservation-card"
                  key={reservation.id}
                >

                  <div className="reservation-icon">
                    P
                  </div>

                  <div>

                    <h3>
                      {reservation.location}
                    </h3>

                    <p>
                      Slot {reservation.slot}
                      {" • "}
                      {reservation.date}
                    </p>

                  </div>

                  <span className="status">
                    Confirmed
                  </span>

                </div>

              ))}

            </div>

          )}

        </main>

      )}


      {/*  LOGIN */}

      {page === "login" && (

        <main className="auth-page">

          <div className="auth-card">

            <div className="brand centered">

              <div className="brand-icon">
                P
              </div>

              <div>
                <h2>SmartPark</h2>
                <span>
                  Parking Reservation System
                </span>
              </div>

            </div>


            <h1>
              Welcome back
            </h1>

            <p>
              Login to manage your parking
              reservations.
            </p>


            <label>
              Email

              <input
                type="email"
                placeholder="you@example.com"
              />

            </label>


            <label>
              Password

              <input
                type="password"
                placeholder="••••••••"
              />

            </label>


            <button
              className="primary-btn full"
              onClick={() => setPage("home")}
            >
              Login
            </button>


            <button
              className="text-btn"
              onClick={() => setPage("home")}
            >
              ← Back to home
            </button>

          </div>

        </main>

      )}


      {/*  FOOTER  */}

      <footer>

        <div>
          <strong>
            SmartPark
          </strong>

          <span>
            {" "}
            Smart Parking Reservation System
          </span>
        </div>

        <span>
          © 2026 SmartPark. All rights reserved.
        </span>

      </footer>

    </div>
  );
}


/*  FEATURE COMPONENT */

function Feature({
  icon,
  title,
  text,
}) {

  return (

    <div className="feature-card">

      <div className="feature-icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </div>

  );
}


/*  LOCATION CARD */

function LocationCard({
  location,
  onReserve,
}) {

  return (

    <div className="location-card">

      <div className="location-image">

        <span>
          ⌖
        </span>

        <small>
          {location.address}
        </small>

      </div>


      <div className="location-info">

        <div className="availability">
          ● {location.available} slots available
        </div>

        <h3>
          {location.name}
        </h3>

        <p>
          {location.address}
        </p>


        <div className="location-bottom">

          <strong>
            Rs. {location.price}

            <small>
              /hour
            </small>

          </strong>


          <button
            className="primary-btn small"
            onClick={onReserve}
          >
            View Slots →
          </button>

        </div>

      </div>

    </div>

  );
}


/* PAGE TITLE */

function PageTitle({
  title,
  text,
}) {

  return (

    <div className="page-title">

      <div className="section-label">
        SMARTPARK
      </div>

      <h1>
        {title}
      </h1>

      <p>
        {text}
      </p>

    </div>

  );

}


export default app;