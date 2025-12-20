/**
 * Database type definitions
 * These should be generated from Supabase or manually defined based on your schema
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          cost_price: number;
          stock: number;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          cost_price?: number;
          stock: number;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          cost_price?: number;
          stock?: number;
          image_url?: string | null;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          total_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status: string;
          total_amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string;
          total_amount?: number;
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_purchase: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_purchase: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price_at_purchase?: number;
        };
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

/**
 * Product Model - TypeScript interface for Product entity
 */
export type Product = Database["public"]["Tables"]["products"]["Row"];

/**
 * Product with additional computed fields (optional)
 */
export interface ProductWithDetails extends Product {
  /** Check if product is in stock */
  isInStock: boolean;
  /** Formatted price string */
  formattedPrice: string;
}
