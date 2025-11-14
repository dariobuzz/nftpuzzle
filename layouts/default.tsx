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
  <div className="w-full flex flex-col items-center justify-center py-3"  style={{ backgroundColor: '#F7F7F7' }}>
    <div className="flex justify-center gap-4">
      <img
        src="/CUL.jpg"
        alt="CUL"
        style={{ height: '40px', margin: '5px 0' }}
      />
      <img
        src="/TOCC.png"
        alt="TOCC"
        style={{ height: '40px', margin: '5px 0' }}
      />
    </div>
    <p style={{ marginTop: '10px', fontSize: '12px', color: '#333' }}>
      Progetto finanziato dall'Unione europea – Next Generation EU
    </p>
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
    <a
  href="https://www.iubenda.com/privacy-policy/16252479"
  className="iubenda-white iubenda-noiframe iubenda-embed"
  title="Privacy Policy"
>Privacy Policy</a>
<a
  href="https://www.iubenda.com/privacy-policy/16252479/cookie-policy"
  className="iubenda-white iubenda-noiframe iubenda-embed"
  title="Cookie Policy"
>Cookie Policy</a>

  </div>
</footer>

		</div>
	);
}
