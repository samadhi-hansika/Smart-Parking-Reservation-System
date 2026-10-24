/* =========================================================
   DEFAULT / FALLBACK DATA (For instant showcase & seeding)
========================================================= */

export const DEFAULT_LOCATIONS = [
  {
    id: "loc-colombo-1",
    name: "Colombo City Centre Deck",
    address: "Sir James Pieris Mawatha, Colombo 02",
    city: "Colombo",
    totalSlots: 24,
    availableSlots: 14,
    price: 150,
    rating: 4.9,
    reviewsCount: 328,
    features: ["Covered", "EV Fast Charging", "24/7 Security", "CCTV", "Disabled Access"],
    popular: true,
    imageGradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)"
  },
  {
    id: "loc-kandy-1",
    name: "Kandy City Centre Car Park",
    address: "Dalada Veediya, Kandy Central",
    city: "Kandy",
    totalSlots: 30,
    availableSlots: 11,
    price: 120,
    rating: 4.8,
    reviewsCount: 215,
    features: ["Covered", "Valet Option", "24/7 Security", "Direct Mall Access"],
    popular: false,
    imageGradient: "linear-gradient(135deg, #065f46, #10b981)"
  },
  {
    id: "loc-galle-1",
    name: "Galle Fort Heritage Park",
    address: "Rampart Street, Galle Fort",
    city: "Galle",
    totalSlots: 18,
    availableSlots: 6,
    price: 100,
    rating: 4.7,
    reviewsCount: 184,
    features: ["Open Air", "Tourist Zone", "CCTV", "Ocean View"],
    popular: false,
    imageGradient: "linear-gradient(135deg, #7c2d12, #f97316)"
  },
  {
    id: "loc-colombo-2",
    name: "One Galle Face Premium Bays",
    address: "1A Centre Road, Colombo 01",
    city: "Colombo",
    totalSlots: 40,
    availableSlots: 21,
    price: 200,
    rating: 4.95,
    reviewsCount: 512,
    features: ["Multi-Level", "Tesla / EV Supercharger", "Valet Parking", "Car Wash Available"],
    popular: true,
    imageGradient: "linear-gradient(135deg, #4c1d95, #8b5cf6)"
  }
];

// Helper to generate slot grid for a location
export function generateFallbackSlots(locationId) {
  const lanes = ["A", "B", "C"];
  const slots = [];
  let count = 0;
  lanes.forEach((lane) => {
    for (let i = 1; i <= 6; i++) {
      count++;
      const slotNumber = `${lane}-${String(i).padStart(2, "0")}`;
      const isEV = i === 1 || i === 6;
      // Some realistic occupied pattern
      const isOccupied = (count % 3 === 0) || (lane === "B" && i === 4);
      slots.push({
        id: `${locationId}-slot-${slotNumber}`,
        locationId: locationId,
        slotNumber: slotNumber,
        type: isEV ? "EV Charging" : i % 2 === 0 ? "Standard" : "Wide / SUV",
        status: isOccupied ? "occupied" : "available",
        floor: "Level 1",
        lane: lane
      });
    }
  });
  return slots;
}
