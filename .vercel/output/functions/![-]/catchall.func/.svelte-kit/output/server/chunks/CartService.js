import { s as supabase } from "./supabase.js";
import { productService } from "./ProductService.js";
class CartRepositoryImpl {
  async getCartItems(userId) {
    let query = supabase.from("cart_items").select(
      `
				*,
				products(*)
			`
    ).order("created_at", { ascending: false });
    if (userId) {
      query = query.eq("user_id", userId);
    } else {
      query = query.is("user_id", null);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch cart items: ${error.message}`);
    return (data || []).map((item) => ({
      ...item,
      product: item.products
    }));
  }
  async addToCart(userId, input) {
    const product = await productService.getProductById(input.product_id);
    if (product.stock < input.quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}`);
    }
    let query = supabase.from("cart_items").select("*").eq("product_id", input.product_id);
    if (userId) {
      query = query.eq("user_id", userId);
    } else {
      query = query.is("user_id", null);
    }
    const { data: existingItem } = await query.maybeSingle();
    if (existingItem) {
      const newQuantity = existingItem.quantity + input.quantity;
      if (product.stock < newQuantity) {
        throw new Error(`Insufficient stock. Available: ${product.stock}`);
      }
      return this.updateCartItem(existingItem.id, { quantity: newQuantity });
    }
    const { data, error } = await supabase.from("cart_items").insert({
      user_id: userId,
      product_id: input.product_id,
      quantity: input.quantity
    }).select().single();
    if (error) throw new Error(`Failed to add to cart: ${error.message}`);
    const items = await this.getCartItems(userId || void 0);
    return items.find((item) => item.id === data.id);
  }
  async updateCartItem(itemId, input) {
    const { data: currentItem, error: fetchError } = await supabase.from("cart_items").select("*, products(*)").eq("id", itemId).single();
    if (fetchError || !currentItem) {
      throw new Error("Cart item not found");
    }
    const product = currentItem.products;
    if (product.stock < input.quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}`);
    }
    const { data, error } = await supabase.from("cart_items").update({ quantity: input.quantity }).eq("id", itemId).select().single();
    if (error) throw new Error(`Failed to update cart item: ${error.message}`);
    const userId = data.user_id || void 0;
    const items = await this.getCartItems(userId);
    return items.find((item) => item.id === data.id);
  }
  async removeCartItem(itemId) {
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
    if (error) throw new Error(`Failed to remove cart item: ${error.message}`);
  }
  async clearCart(userId) {
    let query = supabase.from("cart_items").delete();
    if (userId) {
      query = query.eq("user_id", userId);
    } else {
      query = query.is("user_id", null);
    }
    const { error } = await query;
    if (error) throw new Error(`Failed to clear cart: ${error.message}`);
  }
  async getCartTotal(userId) {
    const items = await this.getCartItems(userId);
    return items.reduce((total, item) => {
      if (item.product) {
        return total + item.product.price * item.quantity;
      }
      return total;
    }, 0);
  }
}
class CartService {
  repository;
  constructor(repository) {
    this.repository = repository || new CartRepositoryImpl();
  }
  async getCartItems(userId) {
    return await this.repository.getCartItems(userId);
  }
  async addToCart(userId, input) {
    if (!input.product_id) throw new Error("Product ID is required");
    if (!input.quantity || input.quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }
    return await this.repository.addToCart(userId, input);
  }
  async updateCartItem(itemId, input) {
    if (!itemId) throw new Error("Cart item ID is required");
    if (!input.quantity || input.quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }
    return await this.repository.updateCartItem(itemId, input);
  }
  async removeCartItem(itemId) {
    if (!itemId) throw new Error("Cart item ID is required");
    await this.repository.removeCartItem(itemId);
  }
  async clearCart(userId) {
    await this.repository.clearCart(userId);
  }
  async getCartTotal(userId) {
    return await this.repository.getCartTotal(userId);
  }
}
const cartService = new CartService();
export {
  cartService as c
};
