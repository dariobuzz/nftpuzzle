import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { fontSans, fontMono } from "@/config/fonts";
import {useRouter} from 'next/router';
import { appWithTranslation } from 'next-i18next'; // Importa appWithTranslation
import "@/styles/globals.css";



function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();
  
	return (
	  <NextUIProvider navigate={router.push}>
		<NextThemesProvider attribute="class" forcedTheme="dark">
		  <Component {...pageProps} />
		</NextThemesProvider>
	  </NextUIProvider>
	);
  }
  
  export default appWithTranslation(MyApp); // Avvolge il componente App

export const fonts = {
	sans: fontSans.style.fontFamily,
	mono: fontMono.style.fontFamily,
};
