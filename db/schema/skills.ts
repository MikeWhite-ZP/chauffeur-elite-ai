import { integer, pgEnum, pgTable, serial, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { chauffeurs } from "./chauffeurs";

export const skillCategoryEnum = pgEnum('skill_category', [
  'safety',
  'customer_service',
  'vehicle_knowledge',
  'navigation',
  'luxury_service',
  'emergency_response'
]);

export const skillTierEnum = pgEnum('skill_tier', [
  'novice',
  'intermediate',
  'advanced',
  'expert',
  'master'
]);

export const driverSkills = pgTable('driver_skills', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: skillCategoryEnum('category').notNull(),
  tier: skillTierEnum('tier').notNull(),
  xpRequired: integer('xp_required').notNull(),
  experiencePoints: integer('experience_points').notNull().default(0),
  levelProgress: integer('level_progress').notNull().default(0),
  icon: text('icon').notNull(),
  benefits: jsonb('benefits').notNull().$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const skillRequirements = pgTable('skill_requirements', {
  id: serial('id').primaryKey(),
  skillId: integer('skill_id').references(() => driverSkills.id).notNull(),
  requiredSkillId: integer('required_skill_id').references(() => driverSkills.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const driverSkillProgress = pgTable('driver_skill_progress', {
  id: serial('id').primaryKey(),
  chauffeurId: integer('chauffeur_id').references(() => chauffeurs.id).notNull(),
  skillId: integer('skill_id').references(() => driverSkills.id).notNull(),
  currentXp: integer('current_xp').notNull().default(0),
  isUnlocked: boolean('is_unlocked').notNull().default(false),
  unlockedAt: timestamp('unlocked_at'),
  lastUpdated: timestamp('last_updated').defaultNow(),
});
