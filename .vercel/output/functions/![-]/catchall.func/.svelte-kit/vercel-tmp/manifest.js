export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.B5SdwbjH.js",app:"_app/immutable/entry/app.D8Az1KfX.js",imports:["_app/immutable/entry/start.B5SdwbjH.js","_app/immutable/chunks/Bv0qn4Z6.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/entry/app.D8Az1KfX.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/IHki7fMi.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js')),
			__memo(() => import('../output/server/nodes/3.js')),
			__memo(() => import('../output/server/nodes/4.js')),
			__memo(() => import('../output/server/nodes/5.js')),
			__memo(() => import('../output/server/nodes/6.js')),
			__memo(() => import('../output/server/nodes/7.js')),
			__memo(() => import('../output/server/nodes/8.js')),
			__memo(() => import('../output/server/nodes/9.js')),
			__memo(() => import('../output/server/nodes/10.js')),
			__memo(() => import('../output/server/nodes/11.js')),
			__memo(() => import('../output/server/nodes/12.js')),
			__memo(() => import('../output/server/nodes/13.js')),
			__memo(() => import('../output/server/nodes/14.js')),
			__memo(() => import('../output/server/nodes/15.js')),
			__memo(() => import('../output/server/nodes/16.js')),
			__memo(() => import('../output/server/nodes/17.js')),
			__memo(() => import('../output/server/nodes/18.js')),
			__memo(() => import('../output/server/nodes/19.js')),
			__memo(() => import('../output/server/nodes/20.js')),
			__memo(() => import('../output/server/nodes/21.js')),
			__memo(() => import('../output/server/nodes/22.js')),
			__memo(() => import('../output/server/nodes/23.js')),
			__memo(() => import('../output/server/nodes/24.js')),
			__memo(() => import('../output/server/nodes/25.js')),
			__memo(() => import('../output/server/nodes/26.js')),
			__memo(() => import('../output/server/nodes/27.js')),
			__memo(() => import('../output/server/nodes/28.js')),
			__memo(() => import('../output/server/nodes/29.js')),
			__memo(() => import('../output/server/nodes/30.js')),
			__memo(() => import('../output/server/nodes/31.js')),
			__memo(() => import('../output/server/nodes/32.js')),
			__memo(() => import('../output/server/nodes/33.js')),
			__memo(() => import('../output/server/nodes/34.js')),
			__memo(() => import('../output/server/nodes/35.js')),
			__memo(() => import('../output/server/nodes/36.js')),
			__memo(() => import('../output/server/nodes/37.js')),
			__memo(() => import('../output/server/nodes/38.js')),
			__memo(() => import('../output/server/nodes/39.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/admin/analytics",
				pattern: /^\/admin\/analytics\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/admin/check-low-stock",
				pattern: /^\/admin\/check-low-stock\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/admin/check-low-stock/_server.ts.js'))
			},
			{
				id: "/admin/content",
				pattern: /^\/admin\/content\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/admin/financial",
				pattern: /^\/admin\/financial\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/admin/inventory/bulk-operations",
				pattern: /^\/admin\/inventory\/bulk-operations\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/admin/inventory/tracking",
				pattern: /^\/admin\/inventory\/tracking\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/admin/kpi-dashboard",
				pattern: /^\/admin\/kpi-dashboard\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/admin/marketing/campaigns",
				pattern: /^\/admin\/marketing\/campaigns\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/admin/marketing/discounts",
				pattern: /^\/admin\/marketing\/discounts\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/admin/marketing/email",
				pattern: /^\/admin\/marketing\/email\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/admin/media",
				pattern: /^\/admin\/media\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/admin/orders",
				pattern: /^\/admin\/orders\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/admin/products",
				pattern: /^\/admin\/products\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/admin/products/templates",
				pattern: /^\/admin\/products\/templates\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/admin/products/[id]/edit",
				pattern: /^\/admin\/products\/([^/]+?)\/edit\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/admin/products/[id]/variants",
				pattern: /^\/admin\/products\/([^/]+?)\/variants\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/admin/profit-loss",
				pattern: /^\/admin\/profit-loss\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/admin/returns",
				pattern: /^\/admin\/returns\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/admin/sales-report",
				pattern: /^\/admin\/sales-report\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/admin/shipping",
				pattern: /^\/admin\/shipping\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/admin/users",
				pattern: /^\/admin\/users\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/api/admin/ai-churn-prediction",
				pattern: /^\/api\/admin\/ai-churn-prediction\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/ai-churn-prediction/_server.ts.js'))
			},
			{
				id: "/api/admin/ai-customer-clv",
				pattern: /^\/api\/admin\/ai-customer-clv\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/ai-customer-clv/_server.ts.js'))
			},
			{
				id: "/api/admin/ai-generate-description",
				pattern: /^\/api\/admin\/ai-generate-description\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/ai-generate-description/_server.ts.js'))
			},
			{
				id: "/api/admin/ai-insights",
				pattern: /^\/api\/admin\/ai-insights\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/ai-insights/_server.ts.js'))
			},
			{
				id: "/api/admin/ai-inventory",
				pattern: /^\/api\/admin\/ai-inventory\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/ai-inventory/_server.ts.js'))
			},
			{
				id: "/api/admin/ai-order-risk",
				pattern: /^\/api\/admin\/ai-order-risk\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/ai-order-risk/_server.ts.js'))
			},
			{
				id: "/api/admin/ai-price-optimization",
				pattern: /^\/api\/admin\/ai-price-optimization\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/ai-price-optimization/_server.ts.js'))
			},
			{
				id: "/api/admin/ai-product-performance",
				pattern: /^\/api\/admin\/ai-product-performance\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/ai-product-performance/_server.ts.js'))
			},
			{
				id: "/api/admin/ai-sales-analytics",
				pattern: /^\/api\/admin\/ai-sales-analytics\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/ai-sales-analytics/_server.ts.js'))
			},
			{
				id: "/api/admin/bulk-operations",
				pattern: /^\/api\/admin\/bulk-operations\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/bulk-operations/_server.ts.js'))
			},
			{
				id: "/api/admin/gemini-customer-analysis",
				pattern: /^\/api\/admin\/gemini-customer-analysis\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/gemini-customer-analysis/_server.ts.js'))
			},
			{
				id: "/api/admin/gemini-marketing-content",
				pattern: /^\/api\/admin\/gemini-marketing-content\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/gemini-marketing-content/_server.ts.js'))
			},
			{
				id: "/api/admin/gemini-sales-summary",
				pattern: /^\/api\/admin\/gemini-sales-summary\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/gemini-sales-summary/_server.ts.js'))
			},
			{
				id: "/api/admin/quick-search",
				pattern: /^\/api\/admin\/quick-search\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/quick-search/_server.ts.js'))
			},
			{
				id: "/api/cart/recommendations",
				pattern: /^\/api\/cart\/recommendations\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/cart/recommendations/_server.ts.js'))
			},
			{
				id: "/api/chat",
				pattern: /^\/api\/chat\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/chat/_server.ts.js'))
			},
			{
				id: "/api/pc-builder/ai-optimize",
				pattern: /^\/api\/pc-builder\/ai-optimize\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/pc-builder/ai-optimize/_server.ts.js'))
			},
			{
				id: "/api/pc-builder/ai-prebuilt",
				pattern: /^\/api\/pc-builder\/ai-prebuilt\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/pc-builder/ai-prebuilt/_server.ts.js'))
			},
			{
				id: "/api/pc-builder/ai-suggest",
				pattern: /^\/api\/pc-builder\/ai-suggest\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/pc-builder/ai-suggest/_server.ts.js'))
			},
			{
				id: "/api/reviews/analyze-sentiment",
				pattern: /^\/api\/reviews\/analyze-sentiment\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/reviews/analyze-sentiment/_server.ts.js'))
			},
			{
				id: "/api/reviews/moderate",
				pattern: /^\/api\/reviews\/moderate\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/reviews/moderate/_server.ts.js'))
			},
			{
				id: "/api/reviews/summary",
				pattern: /^\/api\/reviews\/summary\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/reviews/summary/_server.ts.js'))
			},
			{
				id: "/auth/login",
				pattern: /^\/auth\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/auth/logout",
				pattern: /^\/auth\/logout\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/auth/register",
				pattern: /^\/auth\/register\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 27 },
				endpoint: null
			},
			{
				id: "/cart",
				pattern: /^\/cart\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 28 },
				endpoint: null
			},
			{
				id: "/cart/add",
				pattern: /^\/cart\/add\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/cart/add/_server.ts.js'))
			},
			{
				id: "/checkout",
				pattern: /^\/checkout\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 29 },
				endpoint: null
			},
			{
				id: "/checkout/success",
				pattern: /^\/checkout\/success\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 30 },
				endpoint: null
			},
			{
				id: "/compare",
				pattern: /^\/compare\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 31 },
				endpoint: null
			},
			{
				id: "/compare/analyze",
				pattern: /^\/compare\/analyze\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/compare/analyze/_server.ts.js'))
			},
			{
				id: "/orders",
				pattern: /^\/orders\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 32 },
				endpoint: null
			},
			{
				id: "/orders/[id]",
				pattern: /^\/orders\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 33 },
				endpoint: null
			},
			{
				id: "/pc-builder",
				pattern: /^\/pc-builder\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 34 },
				endpoint: null
			},
			{
				id: "/products",
				pattern: /^\/products\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 35 },
				endpoint: null
			},
			{
				id: "/products/[id]",
				pattern: /^\/products\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 36 },
				endpoint: null
			},
			{
				id: "/profile",
				pattern: /^\/profile\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 37 },
				endpoint: null
			},
			{
				id: "/users",
				pattern: /^\/users\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 38 },
				endpoint: null
			},
			{
				id: "/users/[id]",
				pattern: /^\/users\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 39 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
