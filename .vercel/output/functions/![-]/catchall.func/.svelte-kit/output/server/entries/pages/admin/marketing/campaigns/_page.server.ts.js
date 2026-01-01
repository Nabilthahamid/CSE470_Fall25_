import { r as requireAdmin } from "../../../../../chunks/auth.js";
import { s as supabase } from "../../../../../chunks/supabase.js";
import { d as discountService } from "../../../../../chunks/DiscountService.js";
import { productService } from "../../../../../chunks/ProductService.js";
import { h as handleError } from "../../../../../chunks/errors.js";
class CampaignService {
  /**
   * Get all campaigns
   */
  async getAllCampaigns() {
    try {
      const { data, error } = await supabase.from("promotional_campaigns").select("*").order("start_date", { ascending: false });
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch campaigns: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  /**
   * Get active campaigns
   */
  async getActiveCampaigns() {
    const campaigns = await this.getAllCampaigns();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return campaigns.filter(
      (c) => c.is_active && c.start_date <= now && c.end_date >= now
    );
  }
  /**
   * Get campaign by ID
   */
  async getCampaignById(id) {
    const { data, error } = await supabase.from("promotional_campaigns").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch campaign: ${error.message}`);
    }
    return data;
  }
  /**
   * Create campaign
   */
  async createCampaign(campaign) {
    const { data, error } = await supabase.from("promotional_campaigns").insert({ ...campaign, created_at: (/* @__PURE__ */ new Date()).toISOString() }).select().single();
    if (error) throw new Error(`Failed to create campaign: ${error.message}`);
    return data;
  }
  /**
   * Update campaign
   */
  async updateCampaign(id, campaign) {
    const { data, error } = await supabase.from("promotional_campaigns").update({ ...campaign, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(`Failed to update campaign: ${error.message}`);
    return data;
  }
  /**
   * Delete campaign
   */
  async deleteCampaign(id) {
    const { error } = await supabase.from("promotional_campaigns").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete campaign: ${error.message}`);
  }
  /**
   * Get campaigns by type
   */
  async getCampaignsByType(type) {
    const campaigns = await this.getAllCampaigns();
    return campaigns.filter((c) => c.campaign_type === type);
  }
  /**
   * Get upcoming campaigns
   */
  async getUpcomingCampaigns() {
    const campaigns = await this.getAllCampaigns();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return campaigns.filter((c) => c.is_active && c.start_date > now);
  }
}
const campaignService = new CampaignService();
const load = async ({ locals }) => {
  requireAdmin(locals.user);
  try {
    const [campaigns, discounts, products] = await Promise.all([
      campaignService.getAllCampaigns(),
      discountService.getAllDiscounts(),
      productService.getAllProducts()
    ]);
    return {
      campaigns,
      discounts,
      products,
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      campaigns: [],
      discounts: [],
      products: [],
      error: message
    };
  }
};
const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const productsJson = formData.get("products")?.toString() || "[]";
    const buyXGetYJson = formData.get("buy_x_get_y_config")?.toString();
    const campaign = {
      name: formData.get("name")?.toString() || "",
      description: formData.get("description")?.toString() || void 0,
      campaign_type: formData.get("campaign_type")?.toString() || "flash_sale",
      start_date: formData.get("start_date")?.toString() || "",
      end_date: formData.get("end_date")?.toString() || "",
      is_active: formData.get("is_active")?.toString() === "true",
      discount_id: formData.get("discount_id")?.toString() || void 0,
      products: JSON.parse(productsJson),
      buy_x_get_y_config: buyXGetYJson ? JSON.parse(buyXGetYJson) : void 0,
      image_url: formData.get("image_url")?.toString() || void 0
    };
    try {
      await campaignService.createCampaign(campaign);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  update: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    const campaign = {};
    if (formData.get("name")) campaign.name = formData.get("name")?.toString();
    if (formData.get("description")) campaign.description = formData.get("description")?.toString();
    if (formData.get("campaign_type")) campaign.campaign_type = formData.get("campaign_type")?.toString();
    if (formData.get("start_date")) campaign.start_date = formData.get("start_date")?.toString();
    if (formData.get("end_date")) campaign.end_date = formData.get("end_date")?.toString();
    if (formData.get("is_active") !== null) campaign.is_active = formData.get("is_active")?.toString() === "true";
    if (formData.get("discount_id")) campaign.discount_id = formData.get("discount_id")?.toString() || void 0;
    if (formData.get("products")) campaign.products = JSON.parse(formData.get("products")?.toString() || "[]");
    if (formData.get("buy_x_get_y_config")) campaign.buy_x_get_y_config = JSON.parse(formData.get("buy_x_get_y_config")?.toString() || "{}");
    if (formData.get("image_url")) campaign.image_url = formData.get("image_url")?.toString();
    try {
      await campaignService.updateCampaign(id, campaign);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    try {
      await campaignService.deleteCampaign(id);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  }
};
export {
  actions,
  load
};
