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
			<footer className="w-full mt-25">
  {/* Banda bianca con l'immagine */}
  <div className="w-full bg-white flex justify-center">
    <img
      src="/CUL.jpg"
      alt="CUL"
      style={{ height: '40px', margin: '5px 0' }}
    />
  </div>

  {/* Contenuto del footer */}
  <div className="flex flex-col items-center justify-center py-3" style={{ color: 'white' }}>
    <p>Copyright 2025 @ Artshares srl</p>
    <Link href="/terms" color="primary" className="mt-2 text-sm text-white">
      Terms and Conditions
    </Link>
    <Link href="/co2" color="primary" className="mt-2 text-sm text-white">
      Co2 Compensation
    </Link>
  </div>
</footer>

		</div>
	);
}
