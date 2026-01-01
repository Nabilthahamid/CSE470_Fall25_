import { r as requireAdmin } from "../../../../chunks/auth.js";
import { s as supabase } from "../../../../chunks/supabase.js";
import { h as handleError } from "../../../../chunks/errors.js";
class ShippingService {
  /**
   * Get all shipping providers
   */
  async getAllProviders() {
    try {
      const { data, error } = await supabase.from("shipping_providers").select("*").order("name", { ascending: true });
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch providers: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  /**
   * Get active shipping providers
   */
  async getActiveProviders() {
    const providers = await this.getAllProviders();
    return providers.filter((p) => p.is_active);
  }
  /**
   * Get provider by ID
   */
  async getProviderById(id) {
    const { data, error } = await supabase.from("shipping_providers").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch provider: ${error.message}`);
    }
    return data;
  }
  /**
   * Create shipping provider
   */
  async createProvider(provider) {
    const { data, error } = await supabase.from("shipping_providers").insert({ ...provider, created_at: (/* @__PURE__ */ new Date()).toISOString() }).select().single();
    if (error) throw new Error(`Failed to create provider: ${error.message}`);
    return data;
  }
  /**
   * Update shipping provider
   */
  async updateProvider(id, provider) {
    const { data, error } = await supabase.from("shipping_providers").update({ ...provider, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(`Failed to update provider: ${error.message}`);
    return data;
  }
  /**
   * Delete shipping provider
   */
  async deleteProvider(id) {
    const { error } = await supabase.from("shipping_providers").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete provider: ${error.message}`);
  }
  /**
   * Get all shipping zones
   */
  async getAllZones() {
    try {
      const { data, error } = await supabase.from("shipping_zones").select("*").order("name", { ascending: true });
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch zones: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  /**
   * Get active shipping zones
   */
  async getActiveZones() {
    const zones = await this.getAllZones();
    return zones.filter((z) => z.is_active);
  }
  /**
   * Get zone by ID
   */
  async getZoneById(id) {
    const { data, error } = await supabase.from("shipping_zones").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch zone: ${error.message}`);
    }
    return data;
  }
  /**
   * Get zones by destination
   */
  async getZonesByDestination(country, region) {
    const zones = await this.getActiveZones();
    return zones.filter((z) => {
      if (z.country && z.country !== country) return false;
      if (region && z.regions && !z.regions.includes(region)) return false;
      return true;
    });
  }
  /**
   * Create shipping zone
   */
  async createZone(zone) {
    const { data, error } = await supabase.from("shipping_zones").insert({ ...zone, created_at: (/* @__PURE__ */ new Date()).toISOString() }).select().single();
    if (error) throw new Error(`Failed to create zone: ${error.message}`);
    return data;
  }
  /**
   * Update shipping zone
   */
  async updateZone(id, zone) {
    const { data, error } = await supabase.from("shipping_zones").update({ ...zone, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(`Failed to update zone: ${error.message}`);
    return data;
  }
  /**
   * Delete shipping zone
   */
  async deleteZone(id) {
    const { error } = await supabase.from("shipping_zones").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete zone: ${error.message}`);
  }
  /**
   * Calculate shipping rates
   */
  async calculateShippingRates(calculation) {
    const zones = await this.getZonesByDestination(
      calculation.destination.country,
      calculation.destination.region
    );
    const providers = await this.getActiveProviders();
    const rates = [];
    for (const zone of zones) {
      for (const provider of providers) {
        let rate = zone.base_rate || provider.base_rate;
        if (zone.rate_per_kg && calculation.weight > 0) {
          rate += calculation.weight * zone.rate_per_kg;
        } else if (provider.rate_per_kg && calculation.weight > 0) {
          rate += calculation.weight * provider.rate_per_kg;
        }
        const estimatedDays = Math.ceil(
          (zone.estimated_days_min + zone.estimated_days_max) / 2 || (provider.estimated_days_min + provider.estimated_days_max) / 2
        );
        rates.push({
          provider: provider.name,
          zone: zone.name,
          rate,
          estimated_days: estimatedDays,
          currency: "BDT"
        });
      }
    }
    if (rates.length === 0) {
      for (const provider of providers) {
        let rate = provider.base_rate;
        if (provider.rate_per_kg && calculation.weight > 0) {
          rate += calculation.weight * provider.rate_per_kg;
        }
        rates.push({
          provider: provider.name,
          zone: "Default",
          rate,
          estimated_days: Math.ceil((provider.estimated_days_min + provider.estimated_days_max) / 2),
          currency: "BDT"
        });
      }
    }
    return rates.sort((a, b) => a.rate - b.rate);
  }
  /**
   * Get delivery time estimate
   */
  async getDeliveryTimeEstimate(destination, providerId) {
    const zones = await this.getZonesByDestination(destination.country, destination.region);
    if (zones.length === 0) {
      return { min: 3, max: 7, average: 5 };
    }
    const zone = zones[0];
    return {
      min: zone.estimated_days_min,
      max: zone.estimated_days_max,
      average: Math.ceil((zone.estimated_days_min + zone.estimated_days_max) / 2)
    };
  }
}
const shippingService = new ShippingService();
const load = async ({ locals, url }) => {
  requireAdmin(locals.user);
  try {
    const activeTab = url.searchParams.get("tab") || "providers";
    const [providers, zones] = await Promise.all([
      shippingService.getAllProviders(),
      shippingService.getAllZones()
    ]);
    return {
      activeTab,
      providers,
      zones,
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      activeTab: "providers",
      providers: [],
      zones: [],
      error: message
    };
  }
};
const actions = {
  createProvider: async ({ request }) => {
    const formData = await request.formData();
    const provider = {
      name: formData.get("name")?.toString() || "",
      code: formData.get("code")?.toString() || "",
      api_key: formData.get("api_key")?.toString() || void 0,
      api_secret: formData.get("api_secret")?.toString() || void 0,
      is_active: formData.get("is_active")?.toString() === "true",
      base_rate: parseFloat(formData.get("base_rate")?.toString() || "0"),
      rate_per_kg: formData.get("rate_per_kg") ? parseFloat(formData.get("rate_per_kg")?.toString() || "0") : void 0,
      rate_per_km: formData.get("rate_per_km") ? parseFloat(formData.get("rate_per_km")?.toString() || "0") : void 0,
      estimated_days_min: parseInt(formData.get("estimated_days_min")?.toString() || "1"),
      estimated_days_max: parseInt(formData.get("estimated_days_max")?.toString() || "7")
    };
    try {
      await shippingService.createProvider(provider);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  updateProvider: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    const provider = {};
    if (formData.get("name")) provider.name = formData.get("name")?.toString();
    if (formData.get("api_key")) provider.api_key = formData.get("api_key")?.toString();
    if (formData.get("api_secret")) provider.api_secret = formData.get("api_secret")?.toString();
    if (formData.get("is_active") !== null) provider.is_active = formData.get("is_active")?.toString() === "true";
    if (formData.get("base_rate")) provider.base_rate = parseFloat(formData.get("base_rate")?.toString() || "0");
    if (formData.get("rate_per_kg")) provider.rate_per_kg = parseFloat(formData.get("rate_per_kg")?.toString() || "0");
    if (formData.get("rate_per_km")) provider.rate_per_km = parseFloat(formData.get("rate_per_km")?.toString() || "0");
    if (formData.get("estimated_days_min")) provider.estimated_days_min = parseInt(formData.get("estimated_days_min")?.toString() || "1");
    if (formData.get("estimated_days_max")) provider.estimated_days_max = parseInt(formData.get("estimated_days_max")?.toString() || "7");
    try {
      await shippingService.updateProvider(id, provider);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  deleteProvider: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    try {
      await shippingService.deleteProvider(id);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  createZone: async ({ request }) => {
    const formData = await request.formData();
    const regionsStr = formData.get("regions")?.toString() || "";
    const regions = regionsStr.split(",").map((r) => r.trim()).filter(Boolean);
    const zone = {
      name: formData.get("name")?.toString() || "",
      description: formData.get("description")?.toString() || void 0,
      country: formData.get("country")?.toString() || void 0,
      regions,
      base_rate: parseFloat(formData.get("base_rate")?.toString() || "0"),
      rate_per_kg: formData.get("rate_per_kg") ? parseFloat(formData.get("rate_per_kg")?.toString() || "0") : void 0,
      provider_id: formData.get("provider_id")?.toString() || void 0,
      is_active: formData.get("is_active")?.toString() === "true",
      estimated_days_min: parseInt(formData.get("estimated_days_min")?.toString() || "1"),
      estimated_days_max: parseInt(formData.get("estimated_days_max")?.toString() || "7")
    };
    try {
      await shippingService.createZone(zone);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  updateZone: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    const zone = {};
    if (formData.get("name")) zone.name = formData.get("name")?.toString();
    if (formData.get("description")) zone.description = formData.get("description")?.toString();
    if (formData.get("country")) zone.country = formData.get("country")?.toString();
    if (formData.get("regions")) {
      const regionsStr = formData.get("regions")?.toString() || "";
      zone.regions = regionsStr.split(",").map((r) => r.trim()).filter(Boolean);
    }
    if (formData.get("base_rate")) zone.base_rate = parseFloat(formData.get("base_rate")?.toString() || "0");
    if (formData.get("rate_per_kg")) zone.rate_per_kg = parseFloat(formData.get("rate_per_kg")?.toString() || "0");
    if (formData.get("provider_id")) zone.provider_id = formData.get("provider_id")?.toString() || void 0;
    if (formData.get("is_active") !== null) zone.is_active = formData.get("is_active")?.toString() === "true";
    if (formData.get("estimated_days_min")) zone.estimated_days_min = parseInt(formData.get("estimated_days_min")?.toString() || "1");
    if (formData.get("estimated_days_max")) zone.estimated_days_max = parseInt(formData.get("estimated_days_max")?.toString() || "7");
    try {
      await shippingService.updateZone(id, zone);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  deleteZone: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    try {
      await shippingService.deleteZone(id);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  calculateRate: async ({ request }) => {
    const formData = await request.formData();
    const calculation = {
      weight: parseFloat(formData.get("weight")?.toString() || "0"),
      destination: {
        country: formData.get("country")?.toString() || "",
        region: formData.get("region")?.toString() || void 0,
        city: formData.get("city")?.toString() || void 0,
        postal_code: formData.get("postal_code")?.toString() || void 0
      },
      value: formData.get("value") ? parseFloat(formData.get("value")?.toString() || "0") : void 0
    };
    try {
      const rates = await shippingService.calculateShippingRates(calculation);
      return { success: true, rates };
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
