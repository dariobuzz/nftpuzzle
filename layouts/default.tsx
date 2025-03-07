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
			<p className="text-center"> Progetto finanziato dall’Unione europea – Next Generation EU e inserire i 2 loghi che trovate in allegato  per come previsto dal bando di cui vi riporto di seguito il testo:
			"dd. a garantire il rispetto degli obblighi in materia di comunicazione e informazione previsti dall’art. 34 del Regolamento (UE) 2021/241 indicando nella documentazione progettuale che il progetto è finanziato nell’ambito del PNRR, con esplicito riferimento al finanziamento da parte dell’Unione europea e all’iniziativa Next Generation EU (utilizzando la frase “finanziato dall’Unione europea – Next Generation EU”), riportando nella documentazione progettuale l’emblema dell’Unione europea e fornire un’adeguata diffusione e promozione del progetto, anche online, sia web che social, in linea con quanto previsto dalla Strategia di Comunicazione del PNRR</p>
				
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
