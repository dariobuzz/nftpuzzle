import { useRouter } from 'next/router';
import type { NextRouter } from 'next/router';

const LanguageSelector: React.FC = () => {
  const router: NextRouter = useRouter();
  const { locale, locales, asPath } = router;

  const changeLanguage = (newLocale: string) => {
	console.log("newLocale: ",newLocale);
	console.log("asPath: ",asPath);
    router.push(asPath, asPath, { locale: newLocale });
  };

  return (
    <div className="flex gap-2">
      {(locales || []).map((lng: string) => (
        <button
          key={lng}
          onClick={() => changeLanguage(lng)}
          className={locale === lng ? 'font-bold' : ''}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
