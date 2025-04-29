import { useRouter } from 'next/router';
import type { NextRouter } from 'next/router';

interface LanguageSelectorProps {
  size?: number;      // nuova prop per variare facilmente le dimensioni
  gap?: number;       // nuova prop per variare lo spacing
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  size = 24,         // valore di default 24px
  gap = 1,           // valore di default `gap-1`
}) => {
  const router: NextRouter = useRouter();
  const { locale, locales, asPath } = router;

  const changeLanguage = (newLocale: string) => {
    router.push(asPath, asPath, { locale: newLocale });
  };

  const flags: { [key: string]: string } = {
    it: '/flags/it.jpg',
    en: '/flags/en.jpg',
    fr: '/flags/fr.jpg',
    es: '/flags/es.jpg',
    de: '/flags/de.jpg',
    pt: '/flags/pt.jpg',
  };

  return (
    <div className={`flex gap-${gap}`}>
      {(locales || []).map((lng) => {
        const isActive = locale === lng;
        return (
          <button
            key={lng}
            onClick={() => changeLanguage(lng)}
            className={`
              p-0.5 rounded-full focus:outline-none 
              ${isActive ? 'ring-1 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300'}
            `}
          >
            <img
              src={flags[lng] || '/flags/en.jpg'}
              alt={`Bandiera per ${lng}`}
              width={size}
              height={size}
              className="block rounded-full"
            />
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSelector;
