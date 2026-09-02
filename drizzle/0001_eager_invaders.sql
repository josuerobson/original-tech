CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(180),
	`phone` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diaryEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`phase` varchar(80),
	`progress` int NOT NULL DEFAULT 0,
	`entryDate` timestamp NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diaryEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diaryPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entryId` int NOT NULL,
	`storageKey` varchar(500) NOT NULL,
	`url` text NOT NULL,
	`altText` varchar(180),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diaryPhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectClients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`clientId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projectClients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`description` text,
	`type` varchar(80),
	`location` varchar(180),
	`phase` varchar(80),
	`progress` int NOT NULL DEFAULT 0,
	`status` enum('draft','active','completed') NOT NULL DEFAULT 'draft',
	`coverUrl` text,
	`coverKey` varchar(500),
	`isFeatured` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
