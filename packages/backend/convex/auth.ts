import { expo } from "@better-auth/expo";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import {
	type GenericCtx,
} from "@convex-dev/better-auth/utils";
import { betterAuth } from "better-auth/minimal";
import { anonymous, magicLink, twoFactor } from "better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { type QueryCtx, query } from "./_generated/server";
import authConfig from "./auth.config";

const betterAuthSecret = process.env.BETTER_AUTH_SECRET as string;
const baseSiteUrl = process.env.SITE_URL as string;
const siteUrl =
	!baseSiteUrl.startsWith("http://") && !baseSiteUrl.startsWith("https://")
		? `http://${baseSiteUrl}`
		: baseSiteUrl;

export const authComponent = createClient<DataModel>(components.betterAuth);

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

export const createAuth = (ctx: GenericCtx<DataModel>) =>
	betterAuth({
		baseURL: siteUrl,
		secret: betterAuthSecret,
		trustedOrigins: [
			"http://localhost:3000",
			// Add your production URLs here:
			// "https://yourdomain.com",
			// "myapp://",
			...(process.env.NODE_ENV === "development"
				? [
						"exp://",
						"exp://**",
						"exp://192.168.*.*:*/**",
					]
				: []),
		],

		database: authComponent.adapter(ctx),
		account: {
			accountLinking: {
				enabled: true,
			},
		},
		socialProviders: {
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID as string,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			},
		},
		user: {
			deleteUser: {
				enabled: true,
			},
		},
		plugins: [
			expo(),
			magicLink({
				sendMagicLink: async ({ email, url }) => {
					// TODO: Plug in your email service (e.g. Resend, SendGrid, etc.)
					console.log(`Magic link for ${email}: ${url}`);
				},
			}),
			twoFactor(),
			anonymous(),
			convex({ authConfig, jwksRotateOnTokenGenerationError: true }),
		],
	});

export const safeGetUser = async (ctx: QueryCtx) => {
	const authUser = await authComponent.safeGetAuthUser(ctx);
	if (!authUser) {
		return;
	}
	return authUser;
};

export const getUser = async (ctx: QueryCtx) => {
	const user = await safeGetUser(ctx);
	if (!user) {
		throw new Error("User not found");
	}
	return user;
};

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		return safeGetUser(ctx);
	},
});
