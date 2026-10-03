-- ==============================================================================
-- Brijnidhi Pilgrimage Stay Platform - MySQL Database Schema
-- Compatible with cPanel MySQL®, phpMyAdmin, and MariaDB
-- Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ==============================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+05:30";

-- --------------------------------------------------------
-- 1. Table structure for `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `role` ENUM('SYSTEM_ADMIN', 'HOTEL_ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Table structure for `hotels` (Live Braj Stays Catalog)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `hotels` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `destination_slug` VARCHAR(64) NOT NULL,
  `destination_name` VARCHAR(100) NOT NULL,
  `stay_type` VARCHAR(64) NOT NULL DEFAULT 'hotel',
  `price_per_night` DECIMAL(10,2) NOT NULL DEFAULT '1500.00',
  `original_price` DECIMAL(10,2) NOT NULL DEFAULT '2000.00',
  `star_rating` INT NOT NULL DEFAULT '3',
  `rating_score` DECIMAL(3,1) NOT NULL DEFAULT '4.8',
  `reviews_count` INT NOT NULL DEFAULT '0',
  `address` TEXT NOT NULL,
  `nearest_landmark` VARCHAR(255) NOT NULL,
  `distance_to_main_temple` VARCHAR(255) DEFAULT NULL,
  `short_description` TEXT,
  `description` LONGTEXT,
  `pure_satvik_kitchen` TINYINT(1) NOT NULL DEFAULT '1',
  `temple_darshan_assistance` TINYINT(1) NOT NULL DEFAULT '1',
  `status` ENUM('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'APPROVED',
  `owner_name` VARCHAR(255) DEFAULT NULL,
  `owner_email` VARCHAR(255) DEFAULT NULL,
  `owner_phone` VARCHAR(50) DEFAULT NULL,
  `trade_license_no` VARCHAR(100) DEFAULT NULL,
  `fssai_license_no` VARCHAR(100) DEFAULT NULL,
  `images` LONGTEXT DEFAULT NULL,
  `amenities` LONGTEXT DEFAULT NULL,
  `policies` LONGTEXT DEFAULT NULL,
  `rooms` LONGTEXT DEFAULT NULL,
  `landmark_distances` LONGTEXT DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT '0',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_hotels_slug` (`slug`),
  KEY `idx_hotels_destination` (`destination_slug`),
  KEY `idx_hotels_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Table structure for `onboarding_submissions` (Admin Review Queue)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `onboarding_submissions` (
  `id` VARCHAR(64) NOT NULL,
  `hotel_name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `destination_slug` VARCHAR(64) NOT NULL,
  `destination_name` VARCHAR(100) NOT NULL,
  `stay_type` VARCHAR(64) NOT NULL DEFAULT 'hotel',
  `base_price` DECIMAL(10,2) NOT NULL DEFAULT '1500.00',
  `owner_name` VARCHAR(255) NOT NULL,
  `owner_email` VARCHAR(255) NOT NULL,
  `owner_phone` VARCHAR(50) DEFAULT NULL,
  `nearest_landmark` VARCHAR(255) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `walk_minutes` INT DEFAULT '5',
  `trade_license_no` VARCHAR(100) DEFAULT NULL,
  `fssai_license_no` VARCHAR(100) DEFAULT NULL,
  `pure_satvik_kitchen` TINYINT(1) NOT NULL DEFAULT '1',
  `temple_darshan_assistance` TINYINT(1) NOT NULL DEFAULT '1',
  `documents_verified` TINYINT(1) NOT NULL DEFAULT '0',
  `status` ENUM('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'SUBMITTED',
  `raw_data` LONGTEXT DEFAULT NULL,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_onboard_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Table structure for `bookings`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` VARCHAR(64) NOT NULL,
  `booking_reference` VARCHAR(64) NOT NULL,
  `hotel_id` VARCHAR(64) NOT NULL,
  `hotel_name` VARCHAR(255) NOT NULL,
  `room_id` VARCHAR(64) DEFAULT NULL,
  `room_name` VARCHAR(255) DEFAULT NULL,
  `user_id` VARCHAR(64) DEFAULT NULL,
  `guest_name` VARCHAR(255) NOT NULL,
  `guest_email` VARCHAR(255) NOT NULL,
  `guest_phone` VARCHAR(50) NOT NULL,
  `check_in_date` DATE NOT NULL,
  `check_out_date` DATE NOT NULL,
  `total_nights` INT NOT NULL DEFAULT '1',
  `guests_count` INT NOT NULL DEFAULT '2',
  `rooms_count` INT NOT NULL DEFAULT '1',
  `special_requests` TEXT DEFAULT NULL,
  `darshan_assistance` TINYINT(1) NOT NULL DEFAULT '0',
  `parikrama_rickshaw` TINYINT(1) NOT NULL DEFAULT '0',
  `satvik_thali_meals` TINYINT(1) NOT NULL DEFAULT '0',
  `room_charges` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `tax_amount` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `addon_charges` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `grand_total` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `booking_status` ENUM('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
  `payment_status` ENUM('PENDING', 'PAID', 'REFUNDED', 'FAILED') NOT NULL DEFAULT 'PAID',
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'UPI',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_booking_ref` (`booking_reference`),
  KEY `idx_booking_hotel` (`hotel_id`),
  KEY `idx_booking_user` (`user_id`),
  KEY `idx_booking_status` (`booking_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Table structure for `reviews`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` VARCHAR(64) NOT NULL,
  `hotel_id` VARCHAR(64) NOT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `rating` DECIMAL(3,1) NOT NULL DEFAULT '5.0',
  `cleanliness` DECIMAL(3,1) DEFAULT '5.0',
  `temple_reach` DECIMAL(3,1) DEFAULT '5.0',
  `comment` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_review_hotel` (`hotel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Table structure for `audit_logs`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(64) NOT NULL,
  `admin_name` VARCHAR(255) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(100) NOT NULL,
  `entity_id` VARCHAR(64) DEFAULT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_entity` (`entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Initial Master System Administrator Seed
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `role`, `status`)
VALUES ('usr-admin-01', 'Girish Sharma', 'admin@brijnidhi.org', '+91 99999 88888', 'SYSTEM_ADMIN', 'ACTIVE')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

COMMIT;
