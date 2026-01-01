// MODEL: Email Marketing data structures
export interface Newsletter {
	id?: string;
	name: string;
	subject: string;
	content: string;
	content_type: 'html' | 'text';
	recipient_type: 'all' | 'subscribers' | 'customers' | 'segment';
	recipient_segment?: string; // Segment criteria
	scheduled_at?: string;
	sent_at?: string;
	status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
	recipient_count?: number;
	opened_count: number;
	clicked_count: number;
	created_at?: string;
	updated_at?: string;
}

export interface EmailSequence {
	id?: string;
	name: string;
	trigger: 'welcome' | 'abandoned_cart' | 'order_confirmation' | 'order_shipped' | 'custom';
	trigger_delay?: number; // Hours after trigger
	emails: SequenceEmail[];
	is_active: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface SequenceEmail {
	order: number; // Order in sequence
	subject: string;
	content: string;
	content_type: 'html' | 'text';
	delay_hours: number; // Hours after previous email
}

export interface EmailCampaign {
	id?: string;
	name: string;
	subject: string;
	content: string;
	content_type: 'html' | 'text';
	recipient_count: number;
	sent_count: number;
	opened_count: number;
	clicked_count: number;
	bounced_count: number;
	unsubscribed_count: number;
	started_at?: string;
	completed_at?: string;
	status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
	created_at?: string;
	updated_at?: string;
}

export interface CreateNewsletterDTO {
	name: string;
	subject: string;
	content: string;
	content_type: 'html' | 'text';
	recipient_type: 'all' | 'subscribers' | 'customers' | 'segment';
	recipient_segment?: string;
	scheduled_at?: string;
}

export interface CreateEmailSequenceDTO {
	name: string;
	trigger: 'welcome' | 'abandoned_cart' | 'order_confirmation' | 'order_shipped' | 'custom';
	trigger_delay?: number;
	emails: SequenceEmail[];
	is_active: boolean;
}

export interface EmailAnalytics {
	totalSent: number;
	totalOpened: number;
	totalClicked: number;
	openRate: number;
	clickRate: number;
	bounceRate: number;
	unsubscribeRate: number;
	byCampaign: Array<{
		campaign: string;
		sent: number;
		opened: number;
		clicked: number;
		openRate: number;
		clickRate: number;
	}>;
	byMonth: Array<{
		month: string;
		sent: number;
		opened: number;
		clicked: number;
	}>;
}

