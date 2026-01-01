// UTILS: SEO utility functions
export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '') // Remove special characters
		.replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
		.replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export function generateMetaTitle(productName: string, brand?: string | null, maxLength: number = 60): string {
	let title = productName;
	if (brand) {
		title = `${productName} - ${brand}`;
	}
	if (title.length > maxLength) {
		title = title.substring(0, maxLength - 3) + '...';
	}
	return title;
}

export function generateMetaDescription(
	description: string,
	maxLength: number = 160
): string {
	if (description.length <= maxLength) {
		return description;
	}
	return description.substring(0, maxLength - 3) + '...';
}

export function generateSchemaMarkup(product: {
	name: string;
	description: string;
	price: number;
	image_url?: string | null;
	brand?: string | null;
}): string {
	const schema = {
		'@context': 'https://schema.org/',
		'@type': 'Product',
		name: product.name,
		description: product.description,
		image: product.image_url || '',
		brand: product.brand
			? {
					'@type': 'Brand',
					name: product.brand
				}
			: undefined,
		offers: {
			'@type': 'Offer',
			url: '',
			priceCurrency: 'BDT',
			price: product.price,
			availability: 'https://schema.org/InStock'
		}
	};

	return JSON.stringify(schema, null, 2);
}

