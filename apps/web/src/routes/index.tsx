import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const { data: session, isPending } = authClient.useSession();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-4">
			<h1 className="text-3xl font-bold">My App</h1>
			<p className="text-muted-foreground">
				{isPending
					? "Loading..."
					: session
						? `Signed in as ${session.user.name || session.user.email}`
						: "Not signed in"}
			</p>
		</div>
	);
}
