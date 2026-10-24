-- =============================================================================
-- Brijnidhi Platform - MySQL® Database Schema
-- Dedicated Braj Pilgrimage Stay & Bhojanalaya Management
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `brijnidhi`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `brijnidhi`;

-- 1. USERS & DEVOTEES TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `phone` VARCHAR(32),
  `role` ENUM('CUSTOMER', 'HOTEL_ADMIN', 'SYSTEM_ADMIN') DEFAULT 'CUSTOMER',
  `status` ENUM('ACTIVE', 'SUSPENDED', 'PENDING') DEFAULT 'ACTIVE',
  `password_hash` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. HOTELS TABLE
CREATE TABLE IF NOT EXISTS `hotels` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `destination_slug` VARCHAR(64) NOT NULL,
  `destination_name` VARCHAR(128) NOT NULL,
  `stay_type` VARCHAR(64) NOT NULL DEFAULT 'hotel',
  `price_per_night` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `original_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `star_rating` INT DEFAULT 3,
  `rating_score` DECIMAL(3,1) DEFAULT 4.5,
  `reviews_count` INT DEFAULT 0,
  `address` VARCHAR(500) NOT NULL,
  `nearest_landmark` VARCHAR(255) NOT NULL,
  `distance_to_main_temple` VARCHAR(64),
  `short_description` VARCHAR(500),
  `description` TEXT,
  `pure_satvik_kitchen` TINYINT(1) DEFAULT 1,
  `temple_darshan_assistance` TINYINT(1) DEFAULT 1,
  `status` ENUM('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED') DEFAULT 'APPROVED',
  `owner_name` VARCHAR(255),
  `owner_email` VARCHAR(255),
  `owner_phone` VARCHAR(64),
  `trade_license_no` VARCHAR(128),
  `fssai_license_no` VARCHAR(128),
  `images` JSON,
  `amenities` JSON,
  `policies` JSON,
  `rooms` JSON,
  `landmark_distances` JSON,
  `is_featured` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_hotels_dest` (`destination_slug`),
  INDEX `idx_hotels_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` VARCHAR(64) PRIMARY KEY,
  `booking_reference` VARCHAR(64) UNIQUE NOT NULL,
  `hotel_id` VARCHAR(64) NOT NULL,
  `hotel_name` VARCHAR(255) NOT NULL,
  `room_id` VARCHAR(64),
  `guest_name` VARCHAR(255) NOT NULL,
  `guest_email` VARCHAR(255) NOT NULL,
  `guest_phone` VARCHAR(32) NOT NULL,
  `check_in_date` DATE NOT NULL,
  `check_out_date` DATE NOT NULL,
  `nights` INT DEFAULT 1,
  `guests_count` INT DEFAULT 1,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_status` ENUM('PENDING', 'PAID', 'REFUNDED', 'FAILED') DEFAULT 'PENDING',
  `booking_status` ENUM('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED') DEFAULT 'CONFIRMED',
  `special_requests` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_bookings_hotel` (`hotel_id`),
  INDEX `idx_bookings_guest` (`guest_email`),
  INDEX `idx_bookings_ref` (`booking_reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BHOJANALAYAS TABLE
CREATE TABLE IF NOT EXISTS `bhojanalayas` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `hindi_name` VARCHAR(255),
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `destination_slug` VARCHAR(64) NOT NULL,
  `destination_name` VARCHAR(128) NOT NULL,
  `category` VARCHAR(64) NOT NULL DEFAULT 'thali',
  `category_name` VARCHAR(128) NOT NULL DEFAULT 'Satvik Bhojanalaya',
  `rating_score` DECIMAL(3,1) DEFAULT 4.5,
  `reviews_count` INT DEFAULT 0,
  `price_range` VARCHAR(64) DEFAULT '₹150 - ₹350',
  `avg_cost_for_two` INT DEFAULT 250,
  `address` VARCHAR(500) NOT NULL,
  `nearest_landmark` VARCHAR(255) NOT NULL,
  `distance_to_landmark` VARCHAR(128),
  `walk_minutes` INT DEFAULT 5,
  `timings` VARCHAR(128) DEFAULT '11:00 AM - 10:00 PM',
  `pure_satvik` TINYINT(1) DEFAULT 1,
  `pure_desi_ghee` TINYINT(1) DEFAULT 1,
  `speciality_dishes` JSON,
  `images` JSON,
  `description` TEXT,
  `features` JSON,
  `contact_phone` VARCHAR(64),
  `owner_name` VARCHAR(255),
  `owner_email` VARCHAR(255),
  `fssai_license_no` VARCHAR(128),
  `status` ENUM('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED') DEFAULT 'APPROVED',
  `is_featured` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_bhojan_dest` (`destination_slug`),
  INDEX `idx_bhojan_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BHOJAN RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS `bhojan_reservations` (
  `id` VARCHAR(64) PRIMARY KEY,
  `reservation_reference` VARCHAR(64) UNIQUE NOT NULL,
  `bhojanalaya_id` VARCHAR(64) NOT NULL,
  `bhojanalaya_name` VARCHAR(255) NOT NULL,
  `guest_name` VARCHAR(255) NOT NULL,
  `guest_phone` VARCHAR(32) NOT NULL,
  `guest_email` VARCHAR(255),
  `reservation_date` DATE NOT NULL,
  `meal_time` VARCHAR(64) NOT NULL,
  `thali_count` INT DEFAULT 1,
  `special_requests` TEXT,
  `token_number` VARCHAR(32) NOT NULL,
  `status` ENUM('CONFIRMED', 'COMPLETED', 'CANCELLED') DEFAULT 'CONFIRMED',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_bhojan_res_bhojan` (`bhojanalaya_id`),
  INDEX `idx_bhojan_res_ref` (`reservation_reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BHOJAN MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS `bhojan_menu_items` (
  `id` VARCHAR(64) PRIMARY KEY,
  `bhojanalaya_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `hindi_name` VARCHAR(255),
  `category` VARCHAR(64) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `description` TEXT,
  `pure_desi_ghee` TINYINT(1) DEFAULT 1,
  `is_speciality` TINYINT(1) DEFAULT 0,
  `is_available` TINYINT(1) DEFAULT 1,
  `image_url` VARCHAR(500),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_bhojan_items` (`bhojanalaya_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BHOJAN REVIEWS TABLE
CREATE TABLE IF NOT EXISTS `bhojan_reviews` (
  `id` VARCHAR(64) PRIMARY KEY,
  `bhojanalaya_id` VARCHAR(64) NOT NULL,
  `author_name` VARCHAR(255) NOT NULL,
  `author_city` VARCHAR(128),
  `rating` INT NOT NULL DEFAULT 5,
  `title` VARCHAR(255),
  `comment` TEXT NOT NULL,
  `darshan_experience` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_bhojan_revs` (`bhojanalaya_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(64) PRIMARY KEY,
  `admin_name` VARCHAR(255) NOT NULL,
  `action` VARCHAR(128) NOT NULL,
  `entity_type` VARCHAR(64) NOT NULL,
  `entity_id` VARCHAR(64) NOT NULL,
  `details` TEXT NOT NULL,
  `ip_address` VARCHAR(64) DEFAULT '127.0.0.1',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
