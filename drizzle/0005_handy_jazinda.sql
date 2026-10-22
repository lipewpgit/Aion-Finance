CREATE TABLE `daily_notification_log` (
	`user_id` text NOT NULL,
	`report_date` text NOT NULL,
	`sent_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_id`, `report_date`),
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `daily_notification_log_user_date_idx` ON `daily_notification_log` (`user_id`,`report_date`);