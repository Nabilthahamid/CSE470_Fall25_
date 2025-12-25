// MODEL: Notification data structure and types
export interface Notification {
	id: string;
	user_id?: string | null;
	type: NotificationType;
	title: string;
	message: string;
	product_id?: string | null;
	is_read: boolean;
	created_at?: string;
	// Joined data
	product_name?: string;
}

export type NotificationType = 'low_stock' | 'new_review' | 'system' | 'sale';

export interface CreateNotificationDTO {
	user_id?: string | null;
	type: NotificationType;
	title: string;
	message: string;
	product_id?: string | null;
}

export interface NotificationRepository {
	getAll(userId?: string, filters?: NotificationFilters): Promise<Notification[]>;
	getById(id: string): Promise<Notification | null>;
	getUnreadCount(userId?: string): Promise<number>;
	create(data: CreateNotificationDTO): Promise<Notification>;
	markAsRead(id: string, userId?: string): Promise<void>;
	markAllAsRead(userId?: string): Promise<void>;
	delete(id: string): Promise<void>;
}

export interface NotificationFilters {
	type?: NotificationType;
	is_read?: boolean;
}

