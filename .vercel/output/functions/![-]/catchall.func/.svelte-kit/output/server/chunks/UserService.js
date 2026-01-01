import { s as supabase } from "./supabase.js";
class UserRepositoryImpl {
  async getAll() {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to fetch users: ${error.message}`);
    return data || [];
  }
  async getById(id) {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
    return data;
  }
  async create(input) {
    const { data, error } = await supabase.from("users").insert(input).select().single();
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data;
  }
  async update(id, input) {
    const { data, error } = await supabase.from("users").update({ ...input, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return data;
  }
  async delete(id) {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete user: ${error.message}`);
  }
}
class UserService {
  repository;
  constructor(repository) {
    this.repository = repository || new UserRepositoryImpl();
  }
  /**
   * Get all users with business logic
   */
  async getAllUsers() {
    return await this.repository.getAll();
  }
  /**
   * Get user by ID with validation
   */
  async getUserById(id) {
    if (!id) throw new Error("User ID is required");
    const user = await this.repository.getById(id);
    if (!user) throw new Error("User not found");
    return user;
  }
  /**
   * Create user with validation
   */
  async createUser(input) {
    if (!this.isValidEmail(input.email)) {
      throw new Error("Invalid email format");
    }
    if (!input.name || input.name.trim().length < 2) {
      throw new Error("Name must be at least 2 characters");
    }
    return await this.repository.create(input);
  }
  /**
   * Update user with validation
   */
  async updateUser(id, input) {
    if (!id) throw new Error("User ID is required");
    if (input.email && !this.isValidEmail(input.email)) {
      throw new Error("Invalid email format");
    }
    if (input.name && input.name.trim().length < 2) {
      throw new Error("Name must be at least 2 characters");
    }
    return await this.repository.update(id, input);
  }
  /**
   * Delete user
   */
  async deleteUser(id) {
    if (!id) throw new Error("User ID is required");
    await this.repository.delete(id);
  }
  /**
   * Business logic: Email validation
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
const userService = new UserService();
export {
  UserService,
  userService
};
