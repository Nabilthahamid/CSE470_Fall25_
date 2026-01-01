// SERVICE: Product specs translator - converts technical specs to plain language
import type { Product } from '$lib/models/Product';

export interface SpecExplanation {
	specName: string;
	technicalValue: string;
	plainExplanation: string;
	performanceImplication: string;
	isGoodFor?: string[];
}

export class ProductSpecsTranslatorService {
	/**
	 * Translate product specifications to plain language
	 */
	translateSpecs(product: Product): SpecExplanation[] {
		const explanations: SpecExplanation[] = [];
		const specs = product.specifications || '';

		// CPU specs
		const cpuMatch = specs.match(/(?:cpu|processor)[:\s]+([^\n,]+)/i);
		if (cpuMatch) {
			const cpuSpec = cpuMatch[1].trim();
			explanations.push({
				specName: 'Processor',
				technicalValue: cpuSpec,
				plainExplanation: this.explainCPU(cpuSpec),
				performanceImplication: this.getCPUImplication(cpuSpec),
				isGoodFor: this.getCPUUseCases(cpuSpec)
			});
		}

		// RAM specs
		const ramMatch = specs.match(/(?:ram|memory)[:\s]+([^\n,]+)/i);
		if (ramMatch) {
			const ramSpec = ramMatch[1].trim();
			explanations.push({
				specName: 'Memory (RAM)',
				technicalValue: ramSpec,
				plainExplanation: this.explainRAM(ramSpec),
				performanceImplication: this.getRAMImplication(ramSpec),
				isGoodFor: this.getRAMUseCases(ramSpec)
			});
		}

		// Storage specs
		const storageMatch = specs.match(/(?:storage|ssd|hdd)[:\s]+([^\n,]+)/i);
		if (storageMatch) {
			const storageSpec = storageMatch[1].trim();
			explanations.push({
				specName: 'Storage',
				technicalValue: storageSpec,
				plainExplanation: this.explainStorage(storageSpec),
				performanceImplication: this.getStorageImplication(storageSpec),
				isGoodFor: this.getStorageUseCases(storageSpec)
			});
		}

		// GPU specs
		const gpuMatch = specs.match(/(?:gpu|graphics|video card)[:\s]+([^\n,]+)/i);
		if (gpuMatch) {
			const gpuSpec = gpuMatch[1].trim();
			explanations.push({
				specName: 'Graphics Card',
				technicalValue: gpuSpec,
				plainExplanation: this.explainGPU(gpuSpec),
				performanceImplication: this.getGPUImplication(gpuSpec),
				isGoodFor: this.getGPUUseCases(gpuSpec)
			});
		}

		// Monitor specs
		const monitorMatch = specs.match(/(?:resolution|display|screen)[:\s]+([^\n,]+)/i);
		if (monitorMatch) {
			const monitorSpec = monitorMatch[1].trim();
			explanations.push({
				specName: 'Display',
				technicalValue: monitorSpec,
				plainExplanation: this.explainMonitor(monitorSpec),
				performanceImplication: this.getMonitorImplication(monitorSpec),
				isGoodFor: this.getMonitorUseCases(monitorSpec)
			});
		}

		return explanations;
	}

	/**
	 * Explain CPU specification
	 */
	private explainCPU(spec: string): string {
		const lower = spec.toLowerCase();
		if (lower.includes('i9') || lower.includes('ryzen 9')) {
			return 'High-end processor - Excellent for demanding tasks like video editing, 3D rendering, and gaming.';
		} else if (lower.includes('i7') || lower.includes('ryzen 7')) {
			return 'Powerful processor - Great for gaming, content creation, and multitasking.';
		} else if (lower.includes('i5') || lower.includes('ryzen 5')) {
			return 'Mid-range processor - Good balance of performance and price, suitable for most tasks.';
		} else if (lower.includes('i3') || lower.includes('ryzen 3')) {
			return 'Entry-level processor - Adequate for basic computing, web browsing, and light tasks.';
		}
		return 'Processor that handles your computer\'s calculations and tasks.';
	}

	/**
	 * Get CPU performance implication
	 */
	private getCPUImplication(spec: string): string {
		const lower = spec.toLowerCase();
		if (lower.includes('i9') || lower.includes('ryzen 9')) {
			return 'Can handle the most demanding applications without slowdown.';
		} else if (lower.includes('i7') || lower.includes('ryzen 7')) {
			return 'Handles most applications smoothly, great for multitasking.';
		} else if (lower.includes('i5') || lower.includes('ryzen 5')) {
			return 'Good performance for everyday tasks and moderate gaming.';
		}
		return 'Suitable for basic computing needs.';
	}

	/**
	 * Get CPU use cases
	 */
	private getCPUUseCases(spec: string): string[] {
		const lower = spec.toLowerCase();
		if (lower.includes('i9') || lower.includes('ryzen 9')) {
			return ['Video Editing', '3D Rendering', 'High-End Gaming', 'Streaming'];
		} else if (lower.includes('i7') || lower.includes('ryzen 7')) {
			return ['Gaming', 'Content Creation', 'Multitasking', 'Programming'];
		} else if (lower.includes('i5') || lower.includes('ryzen 5')) {
			return ['General Use', 'Light Gaming', 'Office Work', 'Web Browsing'];
		}
		return ['Basic Computing', 'Web Browsing', 'Office Work'];
	}

	/**
	 * Explain RAM specification
	 */
	private explainRAM(spec: string): string {
		const ramMatch = spec.match(/(\d+)\s*gb/i);
		if (ramMatch) {
			const gb = parseInt(ramMatch[1]);
			if (gb >= 32) {
				return `${gb}GB of memory - Excellent for heavy multitasking, video editing, and running multiple applications simultaneously.`;
			} else if (gb >= 16) {
				return `${gb}GB of memory - Great for gaming, content creation, and running multiple programs at once.`;
			} else if (gb >= 8) {
				return `${gb}GB of memory - Good for everyday computing, light gaming, and basic multitasking.`;
			} else {
				return `${gb}GB of memory - Minimum for basic computing tasks.`;
			}
		}
		return 'Memory (RAM) stores data your computer is actively using for quick access.';
	}

	/**
	 * Get RAM performance implication
	 */
	private getRAMImplication(spec: string): string {
		const ramMatch = spec.match(/(\d+)\s*gb/i);
		if (ramMatch) {
			const gb = parseInt(ramMatch[1]);
			if (gb >= 32) {
				return 'Can run many applications simultaneously without slowdown.';
			} else if (gb >= 16) {
				return 'Smooth performance for most tasks and games.';
			} else if (gb >= 8) {
				return 'Adequate for basic multitasking.';
			}
			return 'May struggle with multiple applications open.';
		}
		return 'Affects how many programs you can run at once.';
	}

	/**
	 * Get RAM use cases
	 */
	private getRAMUseCases(spec: string): string[] {
		const ramMatch = spec.match(/(\d+)\s*gb/i);
		if (ramMatch) {
			const gb = parseInt(ramMatch[1]);
			if (gb >= 32) {
				return ['Video Editing', '3D Rendering', 'Virtual Machines', 'Heavy Multitasking'];
			} else if (gb >= 16) {
				return ['Gaming', 'Content Creation', 'Programming', 'Multitasking'];
			} else if (gb >= 8) {
				return ['General Use', 'Light Gaming', 'Office Work'];
			}
		}
		return ['Basic Computing'];
	}

	/**
	 * Explain storage specification
	 */
	private explainStorage(spec: string): string {
		const lower = spec.toLowerCase();
		const sizeMatch = spec.match(/(\d+)\s*(?:gb|tb)/i);
		const size = sizeMatch ? parseInt(sizeMatch[1]) : 0;
		const unit = sizeMatch?.[2]?.toLowerCase() || 'gb';

		let sizeExplanation = '';
		if (unit === 'tb') {
			sizeExplanation = `${size}TB is ${size * 1000}GB - Can store thousands of files, games, and media.`;
		} else if (size >= 1000) {
			sizeExplanation = `${size}GB (${(size / 1000).toFixed(1)}TB) - Plenty of space for files, games, and applications.`;
		} else if (size >= 500) {
			sizeExplanation = `${size}GB - Good amount of storage for most users.`;
		} else {
			sizeExplanation = `${size}GB - Basic storage, may need external storage for large files.`;
		}

		if (lower.includes('ssd') || lower.includes('nvme')) {
			return `${sizeExplanation} Uses SSD technology for very fast file access and boot times.`;
		} else if (lower.includes('hdd')) {
			return `${sizeExplanation} Uses traditional hard drive - slower but more affordable.`;
		}

		return sizeExplanation;
	}

	/**
	 * Get storage performance implication
	 */
	private getStorageImplication(spec: string): string {
		const lower = spec.toLowerCase();
		if (lower.includes('ssd') || lower.includes('nvme')) {
			return 'Very fast file access, quick boot times, and smooth application loading.';
		} else if (lower.includes('hdd')) {
			return 'Slower file access but more storage capacity for the price.';
		}
		return 'Affects how quickly files and applications load.';
	}

	/**
	 * Get storage use cases
	 */
	private getStorageUseCases(spec: string): string[] {
		const lower = spec.toLowerCase();
		if (lower.includes('ssd') || lower.includes('nvme')) {
			return ['Fast Boot Times', 'Quick Application Loading', 'Gaming', 'Professional Work'];
		}
		return ['File Storage', 'Media Library', 'Backup'];
	}

	/**
	 * Explain GPU specification
	 */
	private explainGPU(spec: string): string {
		const lower = spec.toLowerCase();
		if (lower.includes('rtx 40') || lower.includes('rtx 4090') || lower.includes('rtx 4080')) {
			return 'Latest generation high-end graphics card - Excellent for 4K gaming, ray tracing, and professional rendering.';
		} else if (lower.includes('rtx 30') || lower.includes('rtx 3080') || lower.includes('rtx 3070')) {
			return 'High-performance graphics card - Great for gaming at high resolutions and content creation.';
		} else if (lower.includes('rtx') || lower.includes('gtx')) {
			return 'Dedicated graphics card - Good for gaming and graphics-intensive tasks.';
		} else if (lower.includes('integrated')) {
			return 'Built-in graphics - Suitable for basic tasks but not ideal for gaming.';
		}
		return 'Graphics card that handles video output and 3D rendering.';
	}

	/**
	 * Get GPU performance implication
	 */
	private getGPUImplication(spec: string): string {
		const lower = spec.toLowerCase();
		if (lower.includes('rtx 40')) {
			return 'Can run the latest games at maximum settings with ray tracing enabled.';
		} else if (lower.includes('rtx 30')) {
			return 'Excellent gaming performance at high resolutions.';
		} else if (lower.includes('rtx') || lower.includes('gtx')) {
			return 'Good for gaming and graphics work.';
		}
		return 'Suitable for basic display output.';
	}

	/**
	 * Get GPU use cases
	 */
	private getGPUUseCases(spec: string): string[] {
		const lower = spec.toLowerCase();
		if (lower.includes('rtx 40') || lower.includes('rtx 30')) {
			return ['4K Gaming', 'Ray Tracing', 'Video Editing', '3D Rendering'];
		} else if (lower.includes('rtx') || lower.includes('gtx')) {
			return ['Gaming', 'Content Creation', 'Video Editing'];
		}
		return ['Basic Display', 'Office Work'];
	}

	/**
	 * Explain monitor specification
	 */
	private explainMonitor(spec: string): string {
		const lower = spec.toLowerCase();
		if (lower.includes('4k') || lower.includes('3840') || lower.includes('2160')) {
			return '4K resolution - Ultra-high definition display with 4 times the pixels of Full HD.';
		} else if (lower.includes('1440p') || lower.includes('qhd') || lower.includes('2560')) {
			return '1440p resolution - High definition display, great balance of quality and performance.';
		} else if (lower.includes('1080p') || lower.includes('full hd') || lower.includes('1920')) {
			return '1080p resolution - Standard high definition, good for most uses.';
		}
		return 'Display resolution affects image sharpness and clarity.';
	}

	/**
	 * Get monitor performance implication
	 */
	private getMonitorImplication(spec: string): string {
		const lower = spec.toLowerCase();
		if (lower.includes('4k')) {
			return 'Crisp, detailed images perfect for professional work and high-end gaming.';
		} else if (lower.includes('1440p')) {
			return 'Sharp images with good performance balance.';
		} else if (lower.includes('1080p')) {
			return 'Good image quality suitable for most tasks.';
		}
		return 'Affects how sharp and clear images appear.';
	}

	/**
	 * Get monitor use cases
	 */
	private getMonitorUseCases(spec: string): string[] {
		const lower = spec.toLowerCase();
		if (lower.includes('4k')) {
			return ['Professional Work', 'Video Editing', 'High-End Gaming', 'Content Creation'];
		} else if (lower.includes('1440p')) {
			return ['Gaming', 'Content Creation', 'Professional Work'];
		}
		return ['General Use', 'Office Work', 'Gaming'];
	}

	/**
	 * Check if spec is good for a specific use case
	 */
	isGoodFor(product: Product, useCase: string): boolean {
		const explanations = this.translateSpecs(product);
		return explanations.some((exp) => exp.isGoodFor?.some((uc) => uc.toLowerCase().includes(useCase.toLowerCase())));
	}
}

export const productSpecsTranslatorService = new ProductSpecsTranslatorService();

