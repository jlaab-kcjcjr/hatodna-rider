// Sample delivery requests. Later, these come from the backend when customers order.
// orderTotal = food + delivery fee, the amount the rider collects in cash.
export const SAMPLE_JOBS = [
  {
    store: 'Tiya Nena Carinderia',
    storeAddress: 'Rizal St., Legazpi City',
    customer: 'Maria S.',
    customerAddress: 'Purok 3, Brgy. Bitano, Legazpi City',
    landmark: 'Near the chapel, blue gate',
    distanceKm: 2.4,
    items: [
      { name: 'Bicol Express with rice', qty: 2 },
      { name: 'Sili ice cream', qty: 1 },
    ],
    orderTotal: 299,
    deliveryFee: 49,
  },
  {
    store: 'Daraga Pili Treats',
    storeAddress: 'Brgy. Sagpon, Daraga',
    customer: 'Jun R.',
    customerAddress: 'Brgy. Busay, Daraga',
    landmark: 'Across the basketball court',
    distanceKm: 3.1,
    items: [{ name: 'Pili tart (box of 6)', qty: 1 }],
    orderTotal: 239,
    deliveryFee: 59,
  },
  {
    store: 'Albay Fresh Mart',
    storeAddress: 'Peñaranda St., Legazpi City',
    customer: 'Liza M.',
    customerAddress: 'Brgy. Rawis, Legazpi City',
    landmark: 'Green gate beside the sari-sari store',
    distanceKm: 4.0,
    items: [
      { name: 'Rice 5kg', qty: 1 },
      { name: 'Eggs (1 dozen)', qty: 1 },
    ],
    orderTotal: 469,
    deliveryFee: 69,
  },
];

// Share of each delivery fee the rider keeps. This is an example; your team sets the real rate.
export const RIDER_SHARE = 0.8;