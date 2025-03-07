import { Navbar } from "@/components/navbar";
import { Link } from "@nextui-org/link";
import { Head } from "./head";

export default function DefaultLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="relative flex flex-col h-screen">
			<Head />
			<Navbar />
			<main className="container mx-auto max-w-7xl px-6 flex-grow">
				{children}
			</main>
			<footer style={{ color: 'white' }} className="w-full flex flex-col items-center justify-center py-3">
				<p>Copyright © 2025 NFT Puzzle</p>
				<Link href="/terms" color="primary" className="mt-2 text-sm text-white">
					Terms and Conditions
				</Link>
				<Link href="/co2" color="primary" className="mt-2 text-sm text-white">
					Co2 Compensation
				</Link>
			</footer>
		</div>
	);
}
