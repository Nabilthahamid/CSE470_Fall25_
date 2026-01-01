import { r as requireAdmin } from "../../../../chunks/auth.js";
import { s as supabase } from "../../../../chunks/supabase.js";
import { h as handleError } from "../../../../chunks/errors.js";
class ContentService {
  // Homepage Content
  async getHomepageContent() {
    try {
      const { data, error } = await supabase.from("homepage_content").select("*").maybeSingle();
      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") return null;
        throw new Error(`Failed to fetch homepage content: ${error.message}`);
      }
      return data;
    } catch (error) {
      if (error.code === "42P01") return null;
      return null;
    }
  }
  async updateHomepageContent(content) {
    try {
      const { data: existing, error: checkError } = await supabase.from("homepage_content").select("id").limit(1).maybeSingle();
      if (checkError) {
        if (checkError.code === "42P01") {
          return {
            id: "default",
            hero_title: null,
            hero_subtitle: null,
            hero_image_url: null,
            featured_section_title: null,
            featured_section_content: null,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
        }
        throw new Error(`Failed to check homepage content: ${checkError.message}`);
      }
      if (existing) {
        const { data, error } = await supabase.from("homepage_content").update({ ...content, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", existing.id).select().single();
        if (error) throw new Error(`Failed to update homepage content: ${error.message}`);
        return data;
      } else {
        const { data, error } = await supabase.from("homepage_content").insert({ ...content, created_at: (/* @__PURE__ */ new Date()).toISOString() }).select().single();
        if (error) {
          if (error.code === "42P01") {
            return {
              id: "default",
              hero_title: null,
              hero_subtitle: null,
              hero_image_url: null,
              featured_section_title: null,
              featured_section_content: null,
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            };
          }
          throw new Error(`Failed to create homepage content: ${error.message}`);
        }
        return data;
      }
    } catch (error) {
      if (error.code === "42P01") {
        return {
          id: "default",
          hero_title: null,
          hero_subtitle: null,
          hero_image_url: null,
          featured_section_title: null,
          featured_section_content: null,
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      throw error;
    }
  }
  // Banners
  async getAllBanners() {
    try {
      const { data, error } = await supabase.from("banners").select("*").order("order", { ascending: true });
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch banners: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  async getBannerById(id) {
    const { data, error } = await supabase.from("banners").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch banner: ${error.message}`);
    }
    return data;
  }
  async createBanner(banner) {
    const { data, error } = await supabase.from("banners").insert({ ...banner, created_at: (/* @__PURE__ */ new Date()).toISOString() }).select().single();
    if (error) throw new Error(`Failed to create banner: ${error.message}`);
    return data;
  }
  async updateBanner(id, banner) {
    const { data, error } = await supabase.from("banners").update({ ...banner, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(`Failed to update banner: ${error.message}`);
    return data;
  }
  async deleteBanner(id) {
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete banner: ${error.message}`);
  }
  // Static Pages
  async getAllPages() {
    try {
      const { data, error } = await supabase.from("static_pages").select("*").order("created_at", { ascending: false });
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch pages: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  async getPageBySlug(slug) {
    const { data, error } = await supabase.from("static_pages").select("*").eq("slug", slug).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch page: ${error.message}`);
    }
    return data;
  }
  async createPage(page) {
    const { data, error } = await supabase.from("static_pages").insert({ ...page, created_at: (/* @__PURE__ */ new Date()).toISOString() }).select().single();
    if (error) throw new Error(`Failed to create page: ${error.message}`);
    return data;
  }
  async updatePage(id, page) {
    const { data, error } = await supabase.from("static_pages").update({ ...page, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(`Failed to update page: ${error.message}`);
    return data;
  }
  async deletePage(id) {
    const { error } = await supabase.from("static_pages").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete page: ${error.message}`);
  }
  // FAQs
  async getAllFAQs() {
    try {
      const { data, error } = await supabase.from("faqs").select("*").order("order", { ascending: true });
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch FAQs: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  async getFAQById(id) {
    const { data, error } = await supabase.from("faqs").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch FAQ: ${error.message}`);
    }
    return data;
  }
  async createFAQ(faq) {
    const { data, error } = await supabase.from("faqs").insert({ ...faq, created_at: (/* @__PURE__ */ new Date()).toISOString() }).select().single();
    if (error) throw new Error(`Failed to create FAQ: ${error.message}`);
    return data;
  }
  async updateFAQ(id, faq) {
    const { data, error } = await supabase.from("faqs").update({ ...faq, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(`Failed to update FAQ: ${error.message}`);
    return data;
  }
  async deleteFAQ(id) {
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete FAQ: ${error.message}`);
  }
}
const contentService = new ContentService();
const load = async ({ locals, url }) => {
  requireAdmin(locals.user);
  try {
    const activeTab = url.searchParams.get("tab") || "homepage";
    const results = await Promise.allSettled([
      contentService.getHomepageContent(),
      contentService.getAllBanners(),
      contentService.getAllPages(),
      contentService.getAllFAQs()
    ]);
    const homepageContent = results[0].status === "fulfilled" ? results[0].value : null;
    const banners = results[1].status === "fulfilled" ? results[1].value : [];
    const pages = results[2].status === "fulfilled" ? results[2].value : [];
    const faqs = results[3].status === "fulfilled" ? results[3].value : [];
    return {
      activeTab,
      homepageContent,
      banners,
      pages,
      faqs,
      error: null
    };
  } catch (error) {
    console.error("Error loading content page:", error);
    const { message } = handleError(error);
    return {
      activeTab: "homepage",
      homepageContent: null,
      banners: [],
      pages: [],
      faqs: [],
      error: message
    };
  }
};
const actions = {
  updateHomepage: async ({ request }) => {
    const formData = await request.formData();
    const homepageContent = {
      hero_title: formData.get("hero_title")?.toString() || null,
      hero_subtitle: formData.get("hero_subtitle")?.toString() || null,
      hero_image_url: formData.get("hero_image_url")?.toString() || null,
      featured_section_title: formData.get("featured_section_title")?.toString() || null,
      featured_section_content: formData.get("featured_section_content")?.toString() || null
    };
    try {
      await contentService.updateHomepageContent(homepageContent);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  createBanner: async ({ request }) => {
    const formData = await request.formData();
    const banner = {
      title: formData.get("title")?.toString() || "",
      image_url: formData.get("image_url")?.toString() || "",
      link_url: formData.get("link_url")?.toString() || null,
      link_text: formData.get("link_text")?.toString() || null,
      position: formData.get("position")?.toString() || "top",
      order: parseInt(formData.get("order")?.toString() || "0"),
      is_active: formData.get("is_active")?.toString() === "true",
      start_date: formData.get("start_date")?.toString() || null,
      end_date: formData.get("end_date")?.toString() || null
    };
    try {
      await contentService.createBanner(banner);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  updateBanner: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    const banner = {};
    if (formData.get("title")) banner.title = formData.get("title")?.toString();
    if (formData.get("image_url")) banner.image_url = formData.get("image_url")?.toString();
    if (formData.get("link_url")) banner.link_url = formData.get("link_url")?.toString() || null;
    if (formData.get("link_text")) banner.link_text = formData.get("link_text")?.toString() || null;
    if (formData.get("position")) banner.position = formData.get("position")?.toString();
    if (formData.get("order")) banner.order = parseInt(formData.get("order")?.toString() || "0");
    if (formData.get("is_active") !== null) banner.is_active = formData.get("is_active")?.toString() === "true";
    if (formData.get("start_date")) banner.start_date = formData.get("start_date")?.toString() || null;
    if (formData.get("end_date")) banner.end_date = formData.get("end_date")?.toString() || null;
    try {
      await contentService.updateBanner(id, banner);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  deleteBanner: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    try {
      await contentService.deleteBanner(id);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  createPage: async ({ request }) => {
    const formData = await request.formData();
    const page = {
      slug: formData.get("slug")?.toString() || "",
      title: formData.get("title")?.toString() || "",
      content: formData.get("content")?.toString() || "",
      meta_title: formData.get("meta_title")?.toString() || null,
      meta_description: formData.get("meta_description")?.toString() || null,
      is_published: formData.get("is_published")?.toString() === "true"
    };
    try {
      await contentService.createPage(page);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  updatePage: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    const page = {};
    if (formData.get("slug")) page.slug = formData.get("slug")?.toString();
    if (formData.get("title")) page.title = formData.get("title")?.toString();
    if (formData.get("content")) page.content = formData.get("content")?.toString();
    if (formData.get("meta_title")) page.meta_title = formData.get("meta_title")?.toString() || null;
    if (formData.get("meta_description")) page.meta_description = formData.get("meta_description")?.toString() || null;
    if (formData.get("is_published") !== null) page.is_published = formData.get("is_published")?.toString() === "true";
    try {
      await contentService.updatePage(id, page);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  deletePage: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    try {
      await contentService.deletePage(id);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  createFAQ: async ({ request }) => {
    const formData = await request.formData();
    const faq = {
      question: formData.get("question")?.toString() || "",
      answer: formData.get("answer")?.toString() || "",
      category: formData.get("category")?.toString() || null,
      order: parseInt(formData.get("order")?.toString() || "0"),
      is_published: formData.get("is_published")?.toString() === "true"
    };
    try {
      await contentService.createFAQ(faq);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  updateFAQ: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    const faq = {};
    if (formData.get("question")) faq.question = formData.get("question")?.toString();
    if (formData.get("answer")) faq.answer = formData.get("answer")?.toString();
    if (formData.get("category")) faq.category = formData.get("category")?.toString() || null;
    if (formData.get("order")) faq.order = parseInt(formData.get("order")?.toString() || "0");
    if (formData.get("is_published") !== null) faq.is_published = formData.get("is_published")?.toString() === "true";
    try {
      await contentService.updateFAQ(id, faq);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  deleteFAQ: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    try {
      await contentService.deleteFAQ(id);
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
