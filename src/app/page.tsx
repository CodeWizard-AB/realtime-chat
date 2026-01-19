import CreateRoom from "@/components/home/create-room";
import JoinRoom from "@/components/home/join-room";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal } from "lucide-react";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-6">
			<div className="text-center mb-8 space-y-2">
				<h1 className="text-xl flex items-center justify-center gap-2 font-bold text-primary">
					<Terminal />
					JACKFRUIT_PRIVATE_CHAT
				</h1>
				<p>A private, secure chat room for you</p>
			</div>
			<Tabs defaultValue="create" className="w-87.5 sm:min-w-md">
				<TabsList className="mx-auto mb-6">
					<TabsTrigger value="create">Create Room</TabsTrigger>
					<TabsTrigger value="join">Join Room</TabsTrigger>
				</TabsList>
				<TabsContent value="create">
					<CreateRoom />
				</TabsContent>
				<TabsContent value="join">
					<JoinRoom />
				</TabsContent>
			</Tabs>
		</main>
	);
}
