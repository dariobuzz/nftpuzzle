import { useRouter } from 'next/router';
import type { NextRouter } from 'next/router';

const LanguageSelector: React.FC = () => {
  const router: NextRouter = useRouter();
  const { locale, locales, asPath } = router;

  const changeLanguage = (newLocale: string) => {
    console.log("newLocale: ", newLocale);
    console.log("asPath: ", asPath);
    router.push(asPath, asPath, { locale: newLocale });
  };

  // Mappa dei codici lingua con i rispettivi percorsi delle bandiere (formato jpg)
  const flags: { [key: string]: string } = {
    it: '/flags/it.jpg',
    en: '/flags/en.jpg',
    fr: '/flags/fr.jpg',
    es: '/flags/es.jpg',
    de: '/flags/de.jpg',
    pt: '/flags/pt.jpg',

  };

  return (
    <div className="flex gap-2">
      {(locales || []).map((lng: string) => (
        <button
          key={lng}
          onClick={() => changeLanguage(lng)}
          className={locale === lng ? 'font-bold' : ''}
        >
          <img
            src={flags[lng] || '/flags/en.jpg'} // Fallback se la bandiera non è definita
            alt={`Bandiera per ${lng}`}
            width="32"
            height="32"
            className="cursor-pointer"
          />
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
