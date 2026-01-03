// API: Enhanced PC Builder Compatibility Checker with AI explanations
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllCategories } from '$lib/utils/pc-builder';
import { ProductModel } from '$lib/models/ProductModel';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { components } = await request.json();

		if (!components || !Array.isArray(components)) {
			return json({ error: 'Components array is required' }, { status: 400 });
		}

		const allProductsModels = await ProductModel.getAll();
		const allProducts = allProductsModels.map(p => p.toJSON());
		const categories = await getAllCategories();

		const warnings: Array<{
			type: 'incompatible' | 'warning' | 'bottleneck' | 'optimization';
			component1?: string;
			component2?: string;
			message: string;
			explanation: string;
			suggestion?: string;
		}> = [];

		// Get component details
		const componentDetails = components
			.map((comp: any) => {
				const product = allProducts.find(p => p.id === comp.productId);
				const category = categories.find(c => c.id === comp.categoryId);
				return { ...comp, product, category };
			})
			.filter((comp: any) => comp.product);

		// Check CPU and Motherboard compatibility
		const cpu = componentDetails.find((c: any) => 
			c.category?.name.toLowerCase().includes('cpu')
		);
		const motherboard = componentDetails.find((c: any) => 
			c.category?.name.toLowerCase().includes('motherboard')
		);

		if (cpu && motherboard) {
			const cpuSpecs = cpu.product.specifications?.toLowerCase() || '';
			const moboSpecs = motherboard.product.specifications?.toLowerCase() || '';

			// Check socket compatibility
			const cpuSocket = cpuSpecs.match(/(?:socket|socket type)[:\s]+([a-z0-9]+)/i)?.[1];
			const moboSocket = moboSpecs.match(/(?:socket|socket type)[:\s]+([a-z0-9]+)/i)?.[1];

			if (cpuSocket && moboSocket && cpuSocket.toLowerCase() !== moboSocket.toLowerCase()) {
				warnings.push({
					type: 'incompatible',
					component1: cpu.product.name,
					component2: motherboard.product.name,
					message: 'CPU and Motherboard socket mismatch',
					explanation: `The CPU uses ${cpuSocket} socket, but the motherboard uses ${moboSocket} socket. These are not compatible.`,
					suggestion: 'Choose a motherboard with the same socket type as your CPU, or select a compatible CPU.'
				});
			}
		}

		// Check RAM and Motherboard compatibility
		const ram = componentDetails.find((c: any) => 
			c.category?.name.toLowerCase().includes('ram')
		);

		if (ram && motherboard) {
			const ramSpecs = ram.product.specifications?.toLowerCase() || '';
			const moboSpecs = motherboard.product.specifications?.toLowerCase() || '';

			// Check DDR version
			const ramDDR = ramSpecs.match(/ddr([0-9]+)/i)?.[1];
			const moboDDR = moboSpecs.match(/ddr([0-9]+)/i)?.[1];

			if (ramDDR && moboDDR && ramDDR !== moboDDR) {
				warnings.push({
					type: 'incompatible',
					component1: ram.product.name,
					component2: motherboard.product.name,
					message: 'RAM and Motherboard DDR version mismatch',
					explanation: `The RAM is DDR${ramDDR}, but the motherboard supports DDR${moboDDR}. They are not compatible.`,
					suggestion: 'Select RAM that matches the motherboard\'s DDR version.'
				});
			}
		}

		// Check power requirements
		const psu = componentDetails.find((c: any) => 
			c.category?.name.toLowerCase().includes('power') || 
			c.category?.name.toLowerCase().includes('psu')
		);
		const gpu = componentDetails.find((c: any) => 
			c.category?.name.toLowerCase().includes('graphics') ||
			c.category?.name.toLowerCase().includes('gpu')
		);

		if (psu && gpu) {
			const psuSpecs = psu.product.specifications?.toLowerCase() || '';
			const psuWattage = psuSpecs.match(/(\d+)\s*w/i)?.[1] || 
				psu.product.name.match(/(\d+)\s*w/i)?.[1];

			if (psuWattage) {
				const estimatedPower = 500; // Base estimate
				const gpuPower = 200; // GPU estimate
				const totalEstimate = estimatedPower + gpuPower;

				if (parseInt(psuWattage) < totalEstimate) {
					warnings.push({
						type: 'warning',
						component1: psu.product.name,
						component2: gpu.product.name,
						message: 'Power supply may be insufficient',
						explanation: `Your estimated power consumption (${totalEstimate}W) may exceed the PSU capacity (${psuWattage}W). This could cause system instability.`,
						suggestion: `Consider upgrading to a ${Math.ceil(totalEstimate / 100) * 100}W or higher PSU for better stability.`
					});
				}
			}
		}

		// Check for bottlenecks
		if (cpu && gpu) {
			const cpuPrice = cpu.product.price;
			const gpuPrice = gpu.product.price;
			const priceRatio = gpuPrice / cpuPrice;

			if (priceRatio > 3) {
				warnings.push({
					type: 'bottleneck',
					component1: cpu.product.name,
					component2: gpu.product.name,
					message: 'Potential CPU bottleneck',
					explanation: 'Your GPU is significantly more expensive than your CPU, which may cause the CPU to bottleneck GPU performance.',
					suggestion: 'Consider upgrading to a more powerful CPU to match your GPU\'s performance level.'
				});
			} else if (priceRatio < 0.5) {
				warnings.push({
					type: 'bottleneck',
					component1: cpu.product.name,
					component2: gpu.product.name,
					message: 'Potential GPU bottleneck',
					explanation: 'Your CPU is significantly more expensive than your GPU, which may limit overall system performance.',
					suggestion: 'Consider upgrading to a more powerful GPU to better utilize your CPU.'
				});
			}
		}

		// Optimization suggestions
		if (componentDetails.length > 0) {
			const totalPrice = componentDetails.reduce((sum: number, c: any) => 
				sum + (c.product?.price || 0), 0
			);

			if (totalPrice > 0) {
				// Check if all required components are present
				const requiredCategories = categories.filter(c => c.is_required);
				const selectedCategoryIds = new Set(
					componentDetails.map((c: any) => c.categoryId).filter(Boolean)
				);

				const missingRequired = requiredCategories.filter(
					c => !selectedCategoryIds.has(c.id)
				);

				if (missingRequired.length > 0) {
					warnings.push({
						type: 'optimization',
						message: 'Missing required components',
						explanation: `Your build is missing: ${missingRequired.map(c => c.display_name).join(', ')}. These are essential for a complete PC.`,
						suggestion: 'Add the missing components to complete your build.'
					});
				}
			}
		}

		return json({
			warnings,
			isCompatible: warnings.filter(w => w.type === 'incompatible').length === 0,
			summary: warnings.length === 0 
				? 'All components appear to be compatible!'
				: `${warnings.filter(w => w.type === 'incompatible').length} compatibility issue(s) found.`
		});
	} catch (error: any) {
		console.error('Compatibility check error:', error);
		return json({ error: error.message || 'Failed to check compatibility' }, { status: 500 });
	}
};

