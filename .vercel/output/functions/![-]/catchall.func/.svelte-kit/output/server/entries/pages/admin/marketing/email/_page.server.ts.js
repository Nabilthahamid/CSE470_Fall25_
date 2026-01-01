import { r as requireAdmin } from "../../../../../chunks/auth.js";
import { s as supabase } from "../../../../../chunks/supabase.js";
import { h as handleError } from "../../../../../chunks/errors.js";
class EmailMarketingService {
  /**
   * Get all newsletters
   */
  async getAllNewsletters() {
    try {
      const { data, error } = await supabase.from("newsletters").select("*").order("created_at", { ascending: false });
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch newsletters: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  /**
   * Create newsletter
   */
  async createNewsletter(newsletter) {
    const { data, error } = await supabase.from("newsletters").insert({
      ...newsletter,
      status: newsletter.scheduled_at ? "scheduled" : "draft",
      opened_count: 0,
      clicked_count: 0,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    if (error) throw new Error(`Failed to create newsletter: ${error.message}`);
    return data;
  }
  /**
   * Update newsletter
   */
  async updateNewsletter(id, newsletter) {
    const { data, error } = await supabase.from("newsletters").update({ ...newsletter, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(`Failed to update newsletter: ${error.message}`);
    return data;
  }
  /**
   * Delete newsletter
   */
  async deleteNewsletter(id) {
    const { error } = await supabase.from("newsletters").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete newsletter: ${error.message}`);
  }
  /**
   * Get all email sequences
   */
  async getAllSequences() {
    try {
      const { data, error } = await supabase.from("email_sequences").select("*").order("created_at", { ascending: false });
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch sequences: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  /**
   * Create email sequence
   */
  async createSequence(sequence) {
    const { data, error } = await supabase.from("email_sequences").insert({ ...sequence, created_at: (/* @__PURE__ */ new Date()).toISOString() }).select().single();
    if (error) throw new Error(`Failed to create sequence: ${error.message}`);
    return data;
  }
  /**
   * Update email sequence
   */
  async updateSequence(id, sequence) {
    const { data, error } = await supabase.from("email_sequences").update({ ...sequence, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(`Failed to update sequence: ${error.message}`);
    return data;
  }
  /**
   * Delete email sequence
   */
  async deleteSequence(id) {
    const { error } = await supabase.from("email_sequences").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete sequence: ${error.message}`);
  }
  /**
   * Get all email campaigns
   */
  async getAllCampaigns() {
    try {
      const { data, error } = await supabase.from("email_campaigns").select("*").order("created_at", { ascending: false });
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
   * Get email analytics
   */
  async getEmailAnalytics(startDate, endDate) {
    const campaigns = await this.getAllCampaigns();
    const newsletters = await this.getAllNewsletters();
    let filteredCampaigns = campaigns;
    let filteredNewsletters = newsletters;
    if (startDate || endDate) {
      filteredCampaigns = campaigns.filter((c) => {
        if (startDate && c.created_at && c.created_at < startDate) return false;
        if (endDate && c.created_at && c.created_at > endDate) return false;
        return true;
      });
      filteredNewsletters = newsletters.filter((n) => {
        if (startDate && n.created_at && n.created_at < startDate) return false;
        if (endDate && n.created_at && n.created_at > endDate) return false;
        return true;
      });
    }
    const totalSent = filteredCampaigns.reduce((sum, c) => sum + c.sent_count, 0) + filteredNewsletters.reduce((sum, n) => sum + (n.recipient_count || 0), 0);
    const totalOpened = filteredCampaigns.reduce((sum, c) => sum + c.opened_count, 0) + filteredNewsletters.reduce((sum, n) => sum + n.opened_count, 0);
    const totalClicked = filteredCampaigns.reduce((sum, c) => sum + c.clicked_count, 0) + filteredNewsletters.reduce((sum, n) => sum + n.clicked_count, 0);
    const totalBounced = filteredCampaigns.reduce((sum, c) => sum + c.bounced_count, 0);
    const totalUnsubscribed = filteredCampaigns.reduce((sum, c) => sum + c.unsubscribed_count, 0);
    const openRate = totalSent > 0 ? totalOpened / totalSent * 100 : 0;
    const clickRate = totalSent > 0 ? totalClicked / totalSent * 100 : 0;
    const bounceRate = totalSent > 0 ? totalBounced / totalSent * 100 : 0;
    const unsubscribeRate = totalSent > 0 ? totalUnsubscribed / totalSent * 100 : 0;
    const byCampaign = filteredCampaigns.map((c) => ({
      campaign: c.name,
      sent: c.sent_count,
      opened: c.opened_count,
      clicked: c.clicked_count,
      openRate: c.sent_count > 0 ? c.opened_count / c.sent_count * 100 : 0,
      clickRate: c.sent_count > 0 ? c.clicked_count / c.sent_count * 100 : 0
    }));
    const monthlyMap = /* @__PURE__ */ new Map();
    [...filteredCampaigns, ...filteredNewsletters].forEach((item) => {
      if (!item.created_at) return;
      const date = new Date(item.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyMap.get(monthKey) || { sent: 0, opened: 0, clicked: 0 };
      const sent = "sent_count" in item ? item.sent_count : item.recipient_count || 0;
      monthlyMap.set(monthKey, {
        sent: existing.sent + sent,
        opened: existing.opened + ("opened_count" in item ? item.opened_count : item.opened_count),
        clicked: existing.clicked + ("clicked_count" in item ? item.clicked_count : item.clicked_count)
      });
    });
    const byMonth = Array.from(monthlyMap.entries()).map(([month, data]) => ({ month, ...data })).sort((a, b) => a.month.localeCompare(b.month));
    return {
      totalSent,
      totalOpened,
      totalClicked,
      openRate,
      clickRate,
      bounceRate,
      unsubscribeRate,
      byCampaign,
      byMonth
    };
  }
}
const emailMarketingService = new EmailMarketingService();
const load = async ({ locals, url }) => {
  requireAdmin(locals.user);
  try {
    const startDate = url.searchParams.get("startDate") || void 0;
    const endDate = url.searchParams.get("endDate") || void 0;
    const activeTab = url.searchParams.get("tab") || "newsletters";
    const [newsletters, sequences, campaigns, analytics] = await Promise.all([
      emailMarketingService.getAllNewsletters(),
      emailMarketingService.getAllSequences(),
      emailMarketingService.getAllCampaigns(),
      emailMarketingService.getEmailAnalytics(startDate, endDate)
    ]);
    return {
      activeTab,
      newsletters,
      sequences,
      campaigns,
      analytics,
      startDate: startDate || "",
      endDate: endDate || "",
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      activeTab: "newsletters",
      newsletters: [],
      sequences: [],
      campaigns: [],
      analytics: {
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
        unsubscribeRate: 0,
        byCampaign: [],
        byMonth: []
      },
      startDate: "",
      endDate: "",
      error: message
    };
  }
};
const actions = {
  createNewsletter: async ({ request }) => {
    const formData = await request.formData();
    const newsletter = {
      name: formData.get("name")?.toString() || "",
      subject: formData.get("subject")?.toString() || "",
      content: formData.get("content")?.toString() || "",
      content_type: formData.get("content_type")?.toString() || "html",
      recipient_type: formData.get("recipient_type")?.toString() || "all",
      recipient_segment: formData.get("recipient_segment")?.toString() || void 0,
      scheduled_at: formData.get("scheduled_at")?.toString() || void 0
    };
    try {
      await emailMarketingService.createNewsletter(newsletter);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  deleteNewsletter: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    try {
      await emailMarketingService.deleteNewsletter(id);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  createSequence: async ({ request }) => {
    const formData = await request.formData();
    const emailsJson = formData.get("emails")?.toString() || "[]";
    const sequence = {
      name: formData.get("name")?.toString() || "",
      trigger: formData.get("trigger")?.toString() || "welcome",
      trigger_delay: formData.get("trigger_delay") ? parseInt(formData.get("trigger_delay")?.toString() || "0") : void 0,
      emails: JSON.parse(emailsJson),
      is_active: formData.get("is_active")?.toString() === "true"
    };
    try {
      await emailMarketingService.createSequence(sequence);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  deleteSequence: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    try {
      await emailMarketingService.deleteSequence(id);
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
