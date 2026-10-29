-- ============================================================
-- E-COMMERCE PLATFORM DATABASE
-- Complete Database Schema
-- ============================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS `ecommerce_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `ecommerce_db`;

-- Disable foreign key checks so the DROP TABLE statements can always reset the
-- schema, even when a previous import left child tables behind (prevents
-- MySQL error #1451).
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. USERS & AUTHENTICATION TABLES
-- ============================================================

-- Users Table
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `phone` varchar(20) DEFAULT NULL UNIQUE,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `phone_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `is_admin` tinyint(1) DEFAULT 0,
  `is_seller` tinyint(1) DEFAULT 0,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `users_email_index` (`email`),
  KEY `users_phone_index` (`phone`),
  KEY `users_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password Resets
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL PRIMARY KEY,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Failed Jobs
DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL UNIQUE,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Personal Access Tokens
DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL UNIQUE,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Login Logs
DROP TABLE IF EXISTS `login_logs`;
CREATE TABLE `login_logs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `login_at` timestamp NULL DEFAULT NULL,
  `logout_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `login_logs_user_id_index` (`user_id`),
  CONSTRAINT `login_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. ROLES & PERMISSIONS TABLES
-- ============================================================

-- Roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL UNIQUE,
  `slug` varchar(255) NOT NULL UNIQUE,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permissions
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL UNIQUE,
  `slug` varchar(255) NOT NULL UNIQUE,
  `group` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Role User
DROP TABLE IF EXISTS `role_user`;
CREATE TABLE `role_user` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_user_role_id_user_id_unique` (`role_id`,`user_id`),
  KEY `role_user_user_id_index` (`user_id`),
  CONSTRAINT `role_user_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permission Role
DROP TABLE IF EXISTS `permission_role`;
CREATE TABLE `permission_role` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permission_role_permission_id_role_id_unique` (`permission_id`,`role_id`),
  KEY `permission_role_role_id_index` (`role_id`),
  CONSTRAINT `permission_role_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permission_role_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. SELLER TABLES
-- ============================================================

-- Sellers
DROP TABLE IF EXISTS `sellers`;
CREATE TABLE `sellers` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `store_name` varchar(255) NOT NULL UNIQUE,
  `store_slug` varchar(255) NOT NULL UNIQUE,
  `store_description` text DEFAULT NULL,
  `store_logo` varchar(255) DEFAULT NULL,
  `store_banner` varchar(255) DEFAULT NULL,
  `business_registration_number` varchar(255) DEFAULT NULL,
  `tax_number` varchar(255) DEFAULT NULL,
  `vat_number` varchar(255) DEFAULT NULL,
  `business_type` enum('individual','company','partnership','llc') DEFAULT 'individual',
  `verification_status` enum('pending','approved','rejected','suspended') DEFAULT 'pending',
  `verification_notes` text DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `commission_rate` decimal(5,2) DEFAULT 0.00,
  `rating` decimal(3,2) DEFAULT 0.00,
  `total_reviews` int(11) DEFAULT 0,
  `total_products` int(11) DEFAULT 0,
  `total_orders` int(11) DEFAULT 0,
  `total_revenue` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sellers_user_id_index` (`user_id`),
  KEY `sellers_store_slug_index` (`store_slug`),
  KEY `sellers_verification_status_index` (`verification_status`),
  KEY `sellers_status_index` (`status`),
  CONSTRAINT `sellers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seller Documents
DROP TABLE IF EXISTS `seller_documents`;
CREATE TABLE `seller_documents` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `seller_id` bigint(20) UNSIGNED NOT NULL,
  `document_type` enum('business_registration','tax_certificate','id_proof','bank_statement','other') NOT NULL,
  `document_path` varchar(255) NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `rejection_reason` text DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `seller_documents_seller_id_index` (`seller_id`),
  CONSTRAINT `seller_documents_seller_id_foreign` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seller Bank Accounts
DROP TABLE IF EXISTS `seller_bank_accounts`;
CREATE TABLE `seller_bank_accounts` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `seller_id` bigint(20) UNSIGNED NOT NULL,
  `bank_name` varchar(255) NOT NULL,
  `account_holder_name` varchar(255) NOT NULL,
  `account_number` varchar(255) NOT NULL,
  `branch_name` varchar(255) DEFAULT NULL,
  `swift_code` varchar(255) DEFAULT NULL,
  `iban` varchar(255) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `seller_bank_accounts_seller_id_index` (`seller_id`),
  CONSTRAINT `seller_bank_accounts_seller_id_foreign` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. CATEGORY & PRODUCT TABLES
-- ============================================================

-- Categories
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categories_slug_index` (`slug`),
  KEY `categories_parent_id_index` (`parent_id`),
  KEY `categories_is_active_index` (`is_active`),
  CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Brands
DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `logo` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `brands_slug_index` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `seller_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `brand_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `short_description` text DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `specifications` text DEFAULT NULL,
  `features` text DEFAULT NULL,
  `sku` varchar(255) NOT NULL UNIQUE,
  `barcode` varchar(255) DEFAULT NULL,
  `price` decimal(15,2) NOT NULL,
  `compare_price` decimal(15,2) DEFAULT NULL,
  `cost_price` decimal(15,2) DEFAULT NULL,
  `discount_percentage` decimal(5,2) DEFAULT 0.00,
  `discount_type` enum('percentage','fixed') DEFAULT 'percentage',
  `is_discounted` tinyint(1) DEFAULT 0,
  `stock_quantity` int(11) DEFAULT 0,
  `minimum_stock_alert` int(11) DEFAULT 10,
  `stock_status` enum('in_stock','out_of_stock','pre_order','discontinued') DEFAULT 'in_stock',
  `is_featured` tinyint(1) DEFAULT 0,
  `is_best_seller` tinyint(1) DEFAULT 0,
  `is_new_arrival` tinyint(1) DEFAULT 0,
  `is_trending` tinyint(1) DEFAULT 0,
  `is_approved` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approval_status` enum('pending','approved','rejected','suspended') DEFAULT 'pending',
  `approval_notes` text DEFAULT NULL,
  `weight` decimal(10,2) DEFAULT NULL,
  `weight_unit` varchar(20) DEFAULT 'kg',
  `length` decimal(10,2) DEFAULT NULL,
  `width` decimal(10,2) DEFAULT NULL,
  `height` decimal(10,2) DEFAULT NULL,
  `dimension_unit` varchar(20) DEFAULT 'cm',
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` varchar(255) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT 0.00,
  `total_reviews` int(11) DEFAULT 0,
  `total_views` int(11) DEFAULT 0,
  `total_sales` int(11) DEFAULT 0,
  `total_wishlists` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `products_seller_id_index` (`seller_id`),
  KEY `products_category_id_index` (`category_id`),
  KEY `products_brand_id_index` (`brand_id`),
  KEY `products_slug_index` (`slug`),
  KEY `products_sku_index` (`sku`),
  KEY `products_approval_status_index` (`approval_status`),
  KEY `products_is_active_index` (`is_active`),
  KEY `products_stock_status_index` (`stock_status`),
  KEY `products_is_featured_index` (`is_featured`),
  FULLTEXT KEY `products_name_short_description_description_fulltext` (`name`,`short_description`,`description`),
  CONSTRAINT `products_seller_id_foreign` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `products_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Images
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `image_name` varchar(255) DEFAULT NULL,
  `order` int(11) DEFAULT 0,
  `is_primary` tinyint(1) DEFAULT 0,
  `alt_text` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_images_product_id_index` (`product_id`),
  KEY `product_images_is_primary_index` (`is_primary`),
  CONSTRAINT `product_images_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Variants
DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `sku` varchar(255) NOT NULL UNIQUE,
  `barcode` varchar(255) DEFAULT NULL,
  `price` decimal(15,2) DEFAULT NULL,
  `compare_price` decimal(15,2) DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  `minimum_stock_alert` int(11) DEFAULT 10,
  `stock_status` enum('in_stock','out_of_stock','pre_order') DEFAULT 'in_stock',
  `attributes` json NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_variants_product_id_index` (`product_id`),
  KEY `product_variants_sku_index` (`sku`),
  KEY `product_variants_stock_status_index` (`stock_status`),
  CONSTRAINT `product_variants_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. CART & WISHLIST TABLES
-- ============================================================

-- Carts
DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `coupon_code` varchar(255) DEFAULT NULL,
  `coupon_discount` decimal(15,2) DEFAULT 0.00,
  `subtotal` decimal(15,2) DEFAULT 0.00,
  `discount` decimal(15,2) DEFAULT 0.00,
  `tax` decimal(15,2) DEFAULT 0.00,
  `shipping` decimal(15,2) DEFAULT 0.00,
  `total` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `carts_customer_id_index` (`customer_id`),
  KEY `carts_session_id_index` (`session_id`),
  UNIQUE KEY `carts_customer_id_session_id_unique` (`customer_id`,`session_id`),
  CONSTRAINT `carts_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cart Items
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `cart_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_variant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `seller_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cart_items_cart_id_index` (`cart_id`),
  KEY `cart_items_product_id_index` (`product_id`),
  KEY `cart_items_seller_id_index` (`seller_id`),
  UNIQUE KEY `cart_items_cart_id_product_id_product_variant_id_unique` (`cart_id`,`product_id`,`product_variant_id`),
  CONSTRAINT `cart_items_cart_id_foreign` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_product_variant_id_foreign` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL,
  CONSTRAINT `cart_items_seller_id_foreign` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wishlists
DROP TABLE IF EXISTS `wishlists`;
CREATE TABLE `wishlists` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT 'Default',
  `is_default` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `wishlists_customer_id_index` (`customer_id`),
  CONSTRAINT `wishlists_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wishlist Items
DROP TABLE IF EXISTS `wishlist_items`;
CREATE TABLE `wishlist_items` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `wishlist_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_variant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `wishlist_items_wishlist_id_index` (`wishlist_id`),
  KEY `wishlist_items_product_id_index` (`product_id`),
  UNIQUE KEY `wishlist_items_wishlist_id_product_id_product_variant_id_unique` (`wishlist_id`,`product_id`,`product_variant_id`),
  CONSTRAINT `wishlist_items_wishlist_id_foreign` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_items_product_variant_id_foreign` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. ADDRESS TABLES
-- ============================================================

-- Addresses
DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `address_type` enum('home','office','other') DEFAULT 'home',
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(255) DEFAULT 'Nepal',
  `phone` varchar(20) NOT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `addresses_user_id_index` (`user_id`),
  CONSTRAINT `addresses_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. ORDER TABLES
-- ============================================================

-- Orders
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_number` varchar(255) NOT NULL UNIQUE,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `seller_id` bigint(20) UNSIGNED DEFAULT NULL,
  `address_id` bigint(20) UNSIGNED NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `discount` decimal(15,2) DEFAULT 0.00,
  `tax` decimal(15,2) DEFAULT 0.00,
  `shipping_charge` decimal(15,2) DEFAULT 0.00,
  `total` decimal(15,2) NOT NULL,
  `paid_amount` decimal(15,2) DEFAULT 0.00,
  `due_amount` decimal(15,2) DEFAULT 0.00,
  `status` enum('pending','processing','confirmed','packed','shipped','out_for_delivery','delivered','cancelled','failed','returned','refunded') DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded','partial_refund') DEFAULT 'pending',
  `payment_method` enum('cod','esewa','khalti','connectips','card','bank_transfer','wallet') DEFAULT NULL,
  `payment_transaction_id` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `coupon_code` varchar(255) DEFAULT NULL,
  `coupon_discount` decimal(15,2) DEFAULT 0.00,
  `placed_at` timestamp NULL DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `packed_at` timestamp NULL DEFAULT NULL,
  `shipped_at` timestamp NULL DEFAULT NULL,
  `out_for_delivery_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_order_number_index` (`order_number`),
  KEY `orders_customer_id_index` (`customer_id`),
  KEY `orders_seller_id_index` (`seller_id`),
  KEY `orders_status_index` (`status`),
  KEY `orders_payment_status_index` (`payment_status`),
  KEY `orders_payment_method_index` (`payment_method`),
  CONSTRAINT `orders_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_seller_id_foreign` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_address_id_foreign` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_variant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `seller_id` bigint(20) UNSIGNED NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_sku` varchar(255) NOT NULL,
  `variant_name` varchar(255) DEFAULT NULL,
  `variant_attributes` json DEFAULT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `discount_price` decimal(15,2) DEFAULT 0.00,
  `quantity` int(11) NOT NULL,
  `total` decimal(15,2) NOT NULL,
  `status` enum('pending','processing','confirmed','packed','shipped','delivered','cancelled','returned','refunded') DEFAULT 'pending',
  `commission` decimal(15,2) DEFAULT 0.00,
  `seller_earning` decimal(15,2) DEFAULT 0.00,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_index` (`order_id`),
  KEY `order_items_product_id_index` (`product_id`),
  KEY `order_items_seller_id_index` (`seller_id`),
  KEY `order_items_status_index` (`status`),
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_product_variant_id_foreign` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL,
  CONSTRAINT `order_items_seller_id_foreign` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Status History
DROP TABLE IF EXISTS `order_status_history`;
CREATE TABLE `order_status_history` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('pending','processing','confirmed','packed','shipped','out_for_delivery','delivered','cancelled','failed','returned','refunded') NOT NULL,
  `notes` text DEFAULT NULL,
  `changed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_status_history_order_id_index` (`order_id`),
  KEY `order_status_history_status_index` (`status`),
  CONSTRAINT `order_status_history_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_status_history_changed_by_foreign` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. PAYMENT TABLES
-- ============================================================

-- Payments
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `payment_id` varchar(255) NOT NULL UNIQUE,
  `transaction_id` varchar(255) DEFAULT NULL UNIQUE,
  `payment_method` enum('cod','esewa','khalti','connectips','card','bank_transfer','wallet') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `fee` decimal(15,2) DEFAULT 0.00,
  `net_amount` decimal(15,2) NOT NULL,
  `status` enum('pending','processing','paid','failed','cancelled','refunded','partial_refund') DEFAULT 'pending',
  `response_data` text DEFAULT NULL,
  `failure_reason` text DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `failed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_order_id_index` (`order_id`),
  KEY `payments_customer_id_index` (`customer_id`),
  KEY `payments_payment_id_index` (`payment_id`),
  KEY `payments_transaction_id_index` (`transaction_id`),
  KEY `payments_status_index` (`status`),
  KEY `payments_payment_method_index` (`payment_method`),
  CONSTRAINT `payments_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Transactions
DROP TABLE IF EXISTS `payment_transactions`;
CREATE TABLE `payment_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `payment_id` bigint(20) UNSIGNED NOT NULL,
  `transaction_id` varchar(255) NOT NULL UNIQUE,
  `reference_id` varchar(255) DEFAULT NULL,
  `gateway` varchar(255) NOT NULL,
  `gateway_transaction_id` varchar(255) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `type` enum('charge','refund','capture','authorize','void') NOT NULL,
  `status` enum('pending','success','failed') DEFAULT 'pending',
  `request_data` text DEFAULT NULL,
  `response_data` text DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payment_transactions_payment_id_index` (`payment_id`),
  KEY `payment_transactions_transaction_id_index` (`transaction_id`),
  KEY `payment_transactions_gateway_index` (`gateway`),
  KEY `payment_transactions_status_index` (`status`),
  CONSTRAINT `payment_transactions_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. REVIEW TABLES
-- ============================================================

-- Reviews
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `comment` text DEFAULT NULL,
  `is_verified_purchase` tinyint(1) DEFAULT 0,
  `is_approved` tinyint(1) DEFAULT 1,
  `helpful_count` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_product_id_index` (`product_id`),
  KEY `reviews_order_id_index` (`order_id`),
  KEY `reviews_customer_id_index` (`customer_id`),
  KEY `reviews_is_approved_index` (`is_approved`),
  CONSTRAINT `reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. COUPON TABLES
-- ============================================================

-- Coupons
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL UNIQUE,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percentage','fixed','free_shipping') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `minimum_purchase` decimal(10,2) DEFAULT 0.00,
  `usage_limit` int(11) DEFAULT NULL,
  `per_user_limit` int(11) DEFAULT 1,
  `used_count` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `is_global` tinyint(1) DEFAULT 0,
  `valid_from` timestamp NULL DEFAULT NULL,
  `valid_to` timestamp NULL DEFAULT NULL,
  `applicable_to` enum('all','category','product','seller') DEFAULT 'all',
  `applicable_ids` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `coupons_code_index` (`code`),
  KEY `coupons_valid_from_valid_to_index` (`valid_from`,`valid_to`),
  KEY `coupons_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Coupon Usages
DROP TABLE IF EXISTS `coupon_usages`;
CREATE TABLE `coupon_usages` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `coupon_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `discount_amount` decimal(15,2) NOT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `coupon_usages_coupon_id_index` (`coupon_id`),
  KEY `coupon_usages_user_id_index` (`user_id`),
  KEY `coupon_usages_order_id_index` (`order_id`),
  CONSTRAINT `coupon_usages_coupon_id_foreign` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `coupon_usages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `coupon_usages_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. NOTIFICATION TABLES
-- ============================================================

-- Notifications
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `data` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_index` (`user_id`),
  KEY `notifications_is_read_index` (`is_read`),
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. SETTINGS & CONFIGURATION TABLES
-- ============================================================

-- Settings
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL UNIQUE,
  `value` text DEFAULT NULL,
  `group` varchar(255) DEFAULT NULL,
  `type` enum('text','number','boolean','json','file') DEFAULT 'text',
  `is_public` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `settings_key_index` (`key`),
  KEY `settings_group_index` (`group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. WALLET & LOYALTY TABLES
-- ============================================================

-- Wallets
DROP TABLE IF EXISTS `wallets`;
CREATE TABLE `wallets` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `balance` decimal(15,2) DEFAULT 0.00,
  `currency` varchar(10) DEFAULT 'NPR',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `wallets_user_id_index` (`user_id`),
  UNIQUE KEY `wallets_user_id_unique` (`user_id`),
  CONSTRAINT `wallets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wallet Transactions
DROP TABLE IF EXISTS `wallet_transactions`;
CREATE TABLE `wallet_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `wallet_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('credit','debit','refund','payout','reward','referral') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `balance_after` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `reference_type` varchar(255) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `wallet_transactions_wallet_id_index` (`wallet_id`),
  CONSTRAINT `wallet_transactions_wallet_id_foreign` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. SHIPPING TABLES
-- ============================================================

-- Delivery Partners
DROP TABLE IF EXISTS `delivery_partners`;
CREATE TABLE `delivery_partners` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL UNIQUE,
  `description` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `tracking_url_pattern` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `delivery_partners_code_index` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. SAMPLE DATA INSERTION
-- ============================================================

-- Insert Admin User
INSERT INTO `users` (`first_name`, `last_name`, `email`, `password`, `is_admin`, `status`, `created_at`, `updated_at`) VALUES
('Admin', 'User', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'active', NOW(), NOW());

-- Insert Sample Categories
INSERT INTO `categories` (`name`, `slug`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
('Electronics', 'electronics', 'All electronic products', 1, NOW(), NOW()),
('Fashion', 'fashion', 'Clothing and accessories', 1, NOW(), NOW()),
('Home & Living', 'home-living', 'Home decoration and furniture', 1, NOW(), NOW()),
('Books', 'books', 'Books and stationery', 1, NOW(), NOW()),
('Sports', 'sports', 'Sports equipment and accessories', 1, NOW(), NOW());

-- Insert Sample Brands
INSERT INTO `brands` (`name`, `slug`, `is_active`, `created_at`, `updated_at`) VALUES
('Apple', 'apple', 1, NOW(), NOW()),
('Samsung', 'samsung', 1, NOW(), NOW()),
('Nike', 'nike', 1, NOW(), NOW()),
('Adidas', 'adidas', 1, NOW(), NOW()),
('Sony', 'sony', 1, NOW(), NOW());

-- Insert Settings
INSERT INTO `settings` (`key`, `value`, `group`, `type`, `created_at`, `updated_at`) VALUES
('site_name', 'E-Commerce Platform', 'general', 'text', NOW(), NOW()),
('site_email', 'info@ecommerce.com', 'general', 'text', NOW(), NOW()),
('site_phone', '977-1-1234567', 'general', 'text', NOW(), NOW()),
('currency_symbol', 'Rs.', 'payment', 'text', NOW(), NOW()),
('tax_rate', '13', 'payment', 'number', NOW(), NOW()),
('free_shipping_threshold', '1000', 'shipping', 'number', NOW(), NOW());

-- ============================================================
-- 16. STORED PROCEDURES (Optional)
-- ============================================================

-- Stored Procedure: Get Monthly Sales
DROP PROCEDURE IF EXISTS `GetMonthlySales`;
DELIMITER //
CREATE PROCEDURE `GetMonthlySales`(IN `year` INT)
BEGIN
    SELECT 
        MONTH(created_at) as month,
        YEAR(created_at) as year,
        COUNT(*) as total_orders,
        SUM(total) as total_sales
    FROM orders 
    WHERE YEAR(created_at) = year 
    AND status = 'delivered'
    GROUP BY YEAR(created_at), MONTH(created_at)
    ORDER BY year DESC, month DESC;
END//
DELIMITER ;

-- Stored Procedure: Get Top Selling Products
DROP PROCEDURE IF EXISTS `GetTopSellingProducts`;
DELIMITER //
CREATE PROCEDURE `GetTopSellingProducts`(IN `limit_count` INT)
BEGIN
    SELECT 
        p.id,
        p.name,
        p.sku,
        COUNT(oi.id) as order_count,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total) as total_revenue
    FROM products p
    JOIN order_items oi ON p.id = oi.product_id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'delivered'
    GROUP BY p.id, p.name, p.sku
    ORDER BY total_sold DESC
    LIMIT limit_count;
END//
DELIMITER ;

-- Stored Procedure: Get Seller Performance
DROP PROCEDURE IF EXISTS `GetSellerPerformance`;
DELIMITER //
CREATE PROCEDURE `GetSellerPerformance`(IN `seller_id` INT)
BEGIN
    SELECT 
        s.id,
        s.store_name,
        COUNT(DISTINCT o.id) as total_orders,
        SUM(oi.quantity) as total_items_sold,
        SUM(oi.total) as total_revenue,
        AVG(oi.total) as average_order_value,
        SUM(oi.commission) as total_commission,
        SUM(oi.seller_earning) as total_earnings
    FROM sellers s
    JOIN orders o ON s.id = o.seller_id
    JOIN order_items oi ON o.id = oi.order_id
    WHERE s.id = seller_id
    AND o.status = 'delivered'
    GROUP BY s.id, s.store_name;
END//
DELIMITER ;

-- ============================================================
-- 17. VIEWS (Optional)
-- ============================================================

-- View: Active Products with Seller Info
DROP VIEW IF EXISTS `active_products_view`;
CREATE VIEW `active_products_view` AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.price,
    p.compare_price,
    p.stock_quantity,
    p.stock_status,
    p.rating,
    p.total_reviews,
    s.store_name as seller_store,
    s.store_slug as seller_slug,
    c.name as category_name,
    b.name as brand_name,
    (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
FROM products p
JOIN sellers s ON p.seller_id = s.id
JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
WHERE p.is_active = 1 
AND p.is_approved = 1
AND p.approval_status = 'approved';

-- View: Order Summary
DROP VIEW IF EXISTS `order_summary_view`;
CREATE VIEW `order_summary_view` AS
SELECT 
    o.id,
    o.order_number,
    o.total,
    o.status,
    o.payment_status,
    o.created_at,
    CONCAT(u.first_name, ' ', u.last_name) as customer_name,
    u.email as customer_email,
    s.store_name as seller_store,
    COUNT(oi.id) as item_count,
    SUM(oi.quantity) as total_items
FROM orders o
JOIN users u ON o.customer_id = u.id
LEFT JOIN sellers s ON o.seller_id = s.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.total, o.status, o.payment_status, 
         o.created_at, u.first_name, u.last_name, u.email, s.store_name;

-- ============================================================
-- 18. TRIGGERS (Optional)
-- ============================================================

-- Trigger: Update Product Rating on New Review
DROP TRIGGER IF EXISTS `update_product_rating`;
DELIMITER //
CREATE TRIGGER `update_product_rating` 
AFTER INSERT ON `reviews` 
FOR EACH ROW
BEGIN
    DECLARE avg_rating DECIMAL(3,2);
    DECLARE total_reviews INT;
    
    SELECT AVG(rating), COUNT(*) INTO avg_rating, total_reviews
    FROM reviews 
    WHERE product_id = NEW.product_id 
    AND is_approved = 1;
    
    UPDATE products 
    SET 
        rating = IFNULL(avg_rating, 0),
        total_reviews = total_reviews
    WHERE id = NEW.product_id;
END//
DELIMITER ;

-- Trigger: Update Seller Rating on New Review
DROP TRIGGER IF EXISTS `update_seller_rating`;
DELIMITER //
CREATE TRIGGER `update_seller_rating` 
AFTER INSERT ON `reviews` 
FOR EACH ROW
BEGIN
    DECLARE avg_rating DECIMAL(3,2);
    DECLARE total_reviews INT;
    
    SELECT AVG(rating), COUNT(*) INTO avg_rating, total_reviews
    FROM reviews 
    WHERE product_id IN (SELECT id FROM products WHERE seller_id = (SELECT seller_id FROM products WHERE id = NEW.product_id))
    AND is_approved = 1;
    
    UPDATE sellers 
    SET 
        rating = IFNULL(avg_rating, 0),
        total_reviews = total_reviews
    WHERE id = (SELECT seller_id FROM products WHERE id = NEW.product_id);
END//
DELIMITER ;

-- Trigger: Update Stock on Order
DROP TRIGGER IF EXISTS `update_stock_on_order`;
DELIMITER //
CREATE TRIGGER `update_stock_on_order` 
AFTER INSERT ON `order_items` 
FOR EACH ROW
BEGIN
    UPDATE products 
    SET 
        stock_quantity = stock_quantity - NEW.quantity,
        total_sales = total_sales + NEW.quantity
    WHERE id = NEW.product_id;
    
    -- Update stock status
    UPDATE products 
    SET stock_status = 'out_of_stock' 
    WHERE id = NEW.product_id AND stock_quantity <= 0;
END//
DELIMITER ;

-- ============================================================
-- 19. INDEXES FOR PERFORMANCE
-- ============================================================

-- Additional indexes for better performance
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX idx_orders_seller_status ON orders(seller_id, status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);
CREATE INDEX idx_products_seller_category ON products(seller_id, category_id);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_reviews_product_rating ON reviews(product_id, rating);
CREATE INDEX idx_cart_items_cart_product ON cart_items(cart_id, product_id);
CREATE INDEX idx_coupons_valid ON coupons(valid_from, valid_to, is_active);

-- ============================================================
-- 20. FULLTEXT SEARCH INDEXES
-- ============================================================

-- Fulltext indexes for product search
ALTER TABLE products ADD FULLTEXT INDEX ft_products_search (name, short_description, description);
ALTER TABLE products ADD FULLTEXT INDEX ft_products_name (name);
ALTER TABLE products ADD FULLTEXT INDEX ft_products_sku (sku);

-- Re-enable foreign key checks once the schema is fully created.
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF DATABASE SCRIPT
-- ============================================================