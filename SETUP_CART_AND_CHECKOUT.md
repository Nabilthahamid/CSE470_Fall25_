# Cart & Checkout Setup Guide

## Overview

This application now includes a complete shopping cart and checkout system with automatic invoice email sending.

## Features

- ✅ Shopping cart functionality (add, update, remove items)
- ✅ Checkout process with customer information collection
- ✅ Automatic order creation and sales recording
- ✅ Invoice generation and email sending
- ✅ Order success page

## Database Setup

### Step 1: Run the Cart System Migration

Open `database/migrations/add_cart_system.sql` in your Supabase SQL Editor and run the entire file.

This creates:
- `cart_items` table - Stores items in user carts
- `orders` table - Stores completed orders
- `order_items` table - Stores individual items in each order
- Necessary indexes and RLS policies

## Email Configuration

### Current Implementation

The email service (`src/lib/services/EmailService.ts`) currently logs emails to the console. This allows testing without email service configuration.

### Production Setup

To enable actual email sending, you have several options:

#### Option 1: Using Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to your `.env` file:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```
4. Uncomment the Resend code in `src/lib/services/EmailService.ts` (lines 20-41)
5. Update the `from` email address to your verified domain

#### Option 2: Using SendGrid

1. Install SendGrid package:
   ```bash
   npm install @sendgrid/mail
   ```
2. Update `EmailService.ts`:
   ```typescript
   import sgMail from '@sendgrid/mail';
   sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
   
   async sendEmail(options: EmailOptions): Promise<void> {
     await sgMail.send({
       from: 'noreply@yourdomain.com',
       to: options.to,
       subject: options.subject,
       html: options.html,
       text: options.text
     });
   }
   ```

#### Option 3: Using Nodemailer

1. Install Nodemailer:
   ```bash
   npm install nodemailer
   npm install -D @types/nodemailer
   ```
2. Configure SMTP settings in `EmailService.ts`

## Usage

### Customer Flow

1. **Browse Products**: Visit `/products` to see all available products
2. **Add to Cart**: Click "Add to Cart" on any product
3. **View Cart**: Click "Cart" in the navigation to see cart items
4. **Update/Remove Items**: Modify quantities or remove items from cart
5. **Checkout**: Click "Proceed to Checkout" to complete the order
6. **Enter Information**: Fill in customer details (name, email, address, phone)
7. **Complete Order**: Click "Complete Order"
8. **Success**: View order confirmation and receive invoice via email

### Admin Features

- View all orders in Sales Report (`/admin/sales-report`)
- Track profit/loss in Profit/Loss Report (`/admin/profit-loss`)
- All orders automatically create sales records for reporting

## Order Processing Flow

When a customer completes checkout:

1. ✅ Order is created in `orders` table
2. ✅ Order items are created in `order_items` table
3. ✅ Sales records are automatically created (for reporting)
4. ✅ Product stock is automatically decreased
5. ✅ Cart is cleared
6. ✅ Invoice email is sent to customer

## Invoice Email

The invoice includes:
- Order number and date
- Customer information
- Itemized list of products
- Quantities and prices
- Total amount
- Order status

The invoice is sent as both HTML (formatted) and plain text (fallback).

## Cart Management

- **Guest Carts**: Works for non-logged-in users (stored by session)
- **User Carts**: Persistent carts for logged-in users
- **Stock Validation**: Prevents adding more items than available stock
- **Auto Updates**: Stock is checked when adding/updating cart items

## Testing

### Test Cart Flow

1. Add products to cart
2. Update quantities
3. Remove items
4. Proceed to checkout
5. Check console logs for invoice email (until email service is configured)

### Test Email

Currently, invoices are logged to the console. Check your server logs to see the generated invoice HTML.

## Notes

- The email service must be configured for production use
- All orders are automatically marked as "completed" status
- Orders create sales records for profit/loss tracking
- Low stock notifications are triggered when products reach ≤3 items

