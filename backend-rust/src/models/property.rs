use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Room {
    pub id: String,
    #[serde(rename = "roomName")]
    pub room_name: String,
    #[serde(rename = "roomNumber")]
    pub room_number: String,
    #[serde(rename = "roomType")]
    pub room_type: String, // Single Room, Double Room, Deluxe Room, Suite, Family Room
    #[serde(rename = "numberOfBeds")]
    pub number_of_beds: u32,
    #[serde(rename = "maxGuests")]
    pub max_guests: u32,
    #[serde(rename = "pricePerNight")]
    pub price_per_night: f64,
    pub discount: f64,
    pub taxes: f64,
    pub amenities: Vec<String>,
    pub images: Vec<String>,
    pub availability: bool,
    pub status: String, // Available, Occupied, Reserved, Maintenance, Blocked
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HotelDetails {
    #[serde(rename = "starRating")]
    pub star_rating: u32,
    #[serde(rename = "checkInTime")]
    pub check_in_time: String,
    #[serde(rename = "checkOutTime")]
    pub check_out_time: String,
    #[serde(rename = "totalRooms")]
    pub total_rooms: u32,
    #[serde(rename = "availableRooms")]
    pub available_rooms: u32,
    pub amenities: Vec<String>,
    #[serde(default)]
    pub rooms: Vec<Room>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MenuItem {
    pub id: String,
    pub category: String, // Breakfast, Lunch, Dinner, Snacks, Beverages, Desserts
    #[serde(rename = "foodName")]
    pub food_name: String,
    pub description: String,
    pub price: f64,
    pub discount: f64,
    #[serde(rename = "isVeg")]
    pub is_veg: bool,
    #[serde(rename = "isJain")]
    pub is_jain: bool,
    pub availability: bool,
    pub image: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RestaurantDetails {
    #[serde(rename = "cuisineTypes")]
    pub cuisine_types: Vec<String>,
    #[serde(rename = "openingTime")]
    pub opening_time: String,
    #[serde(rename = "closingTime")]
    pub closing_time: String,
    #[serde(rename = "seatingCapacity")]
    pub seating_capacity: u32,
    #[serde(rename = "averageCost")]
    pub average_cost: f64,
    #[serde(default)]
    pub menu: Vec<MenuItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AshramDetails {
    #[serde(rename = "checkInTime")]
    pub check_in_time: String,
    #[serde(rename = "checkOutTime")]
    pub check_out_time: String,
    #[serde(rename = "accommodationAvailability")]
    pub accommodation_availability: bool,
    #[serde(rename = "totalRooms")]
    pub total_rooms: u32,
    #[serde(rename = "totalBeds")]
    pub total_beds: u32,
    #[serde(rename = "donationAmount")]
    pub donation_amount: f64,
    #[serde(rename = "bookingPrice")]
    pub booking_price: f64,
    #[serde(rename = "stayType")]
    pub stay_type: String, // Paid booking, Free stay, Donation-based stay, Volunteer stay
    pub rules: Vec<String>,
    pub facilities: Vec<String>, // Meditation Hall, Yoga, Food, Prasad, Parking, Gaushala, Temple, etc.
    #[serde(default)]
    pub rooms: Vec<Room>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DharamshalaDetails {
    #[serde(rename = "totalRooms")]
    pub total_rooms: u32,
    #[serde(rename = "totalBeds")]
    pub total_beds: u32,
    #[serde(rename = "roomTypes")]
    pub room_types: Vec<String>,
    #[serde(rename = "pricePerNight")]
    pub price_per_night: f64,
    #[serde(rename = "checkInTime")]
    pub check_in_time: String,
    #[serde(rename = "checkOutTime")]
    pub check_out_time: String,
    pub amenities: Vec<String>,
    pub rules: Vec<String>,
    pub parking: bool,
    #[serde(rename = "foodAvailability")]
    pub food_availability: bool,
    #[serde(default)]
    pub rooms: Vec<Room>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vehicle {
    pub id: String,
    #[serde(rename = "vehicleNumber")]
    pub vehicle_number: String,
    #[serde(rename = "vehicleType")]
    pub vehicle_type: String, // Car, E-Rickshaw, Auto, Bus, Tempo Traveller, Bike, Other
    pub model: String,
    pub brand: String,
    #[serde(rename = "seatingCapacity")]
    pub seating_capacity: u32,
    #[serde(rename = "driverName")]
    pub driver_name: String,
    #[serde(rename = "driverPhone")]
    pub driver_phone: String,
    #[serde(rename = "ownerName")]
    pub owner_name: String,
    #[serde(rename = "pricePerHour")]
    pub price_per_hour: f64,
    #[serde(rename = "pricePerKm")]
    pub price_per_km: f64,
    #[serde(rename = "dailyPrice")]
    pub daily_price: f64,
    pub availability: bool,
    pub status: String, // Available, Booked, On Trip, Maintenance, Inactive
    pub images: Vec<String>,
    pub documents: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransportDetails {
    #[serde(rename = "vehicleTypes")]
    pub vehicle_types: Vec<String>,
    #[serde(default)]
    pub vehicles: Vec<Vehicle>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Property {
    pub id: String,
    pub name: String,
    pub slug: String,
    #[serde(rename = "propertyType")]
    pub property_type: String, // Hotel, Restaurant, Ashram, Dharamshala, Transport
    pub description: String,
    #[serde(rename = "ownerName")]
    pub owner_name: String,
    #[serde(rename = "contactNumber")]
    pub contact_number: String,
    pub email: String,
    pub website: Option<String>,
    pub status: String, // Active, Inactive, Pending, Under Review, Rejected
    #[serde(rename = "rejectionReason")]
    pub rejection_reason: Option<String>,
    pub rating: f64,
    #[serde(rename = "totalBookings")]
    pub total_bookings: u32,
    #[serde(rename = "totalRevenue")]
    pub total_revenue: f64,
    #[serde(rename = "createdDate")]
    pub created_date: String,

    // Location
    pub address: String,
    pub city: String,
    pub state: String,
    pub country: String,
    pub pincode: String,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    #[serde(rename = "nearbyLandmark")]
    pub nearby_landmark: Option<String>,

    // Media
    #[serde(rename = "mainImage")]
    pub main_image: Option<String>,
    #[serde(rename = "galleryImages", default)]
    pub gallery_images: Vec<String>,
    #[serde(rename = "coverImage")]
    pub cover_image: Option<String>,
    #[serde(default)]
    pub videos: Vec<String>,

    // Type-Specific Extensions
    #[serde(rename = "hotelDetails")]
    pub hotel_details: Option<HotelDetails>,
    #[serde(rename = "restaurantDetails")]
    pub restaurant_details: Option<RestaurantDetails>,
    #[serde(rename = "ashramDetails")]
    pub ashram_details: Option<AshramDetails>,
    #[serde(rename = "dharamshalaDetails")]
    pub dharamshala_details: Option<DharamshalaDetails>,
    #[serde(rename = "transportDetails")]
    pub transport_details: Option<TransportDetails>,
}

#[derive(Debug, Deserialize)]
pub struct CreatePropertyDto {
    pub name: String,
    #[serde(rename = "propertyType")]
    pub property_type: String,
    pub description: Option<String>,
    #[serde(rename = "ownerName")]
    pub owner_name: Option<String>,
    #[serde(rename = "contactNumber")]
    pub contact_number: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
    pub status: Option<String>,

    // Location
    pub address: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub country: Option<String>,
    pub pincode: Option<String>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    #[serde(rename = "nearbyLandmark")]
    pub nearby_landmark: Option<String>,

    // Media
    #[serde(rename = "mainImage")]
    pub main_image: Option<String>,
    #[serde(rename = "galleryImages", default)]
    pub gallery_images: Vec<String>,
    #[serde(rename = "coverImage")]
    pub cover_image: Option<String>,
    #[serde(default)]
    pub videos: Vec<String>,

    // Extensions
    #[serde(rename = "hotelDetails")]
    pub hotel_details: Option<HotelDetails>,
    #[serde(rename = "restaurantDetails")]
    pub restaurant_details: Option<RestaurantDetails>,
    #[serde(rename = "ashramDetails")]
    pub ashram_details: Option<AshramDetails>,
    #[serde(rename = "dharamshalaDetails")]
    pub dharamshala_details: Option<DharamshalaDetails>,
    #[serde(rename = "transportDetails")]
    pub transport_details: Option<TransportDetails>,
}

#[derive(Debug, Deserialize)]
pub struct RejectPropertyDto {
    pub reason: String,
}
