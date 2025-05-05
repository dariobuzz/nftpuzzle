import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import DefaultLayout from '@/layouts/default';
import { title, subtitle } from '@/components/primitives';
import ReactMarkdown from 'react-markdown';
import LanguageSelector from '@/components/selector';

const TermsPage = () => {
  // Usa "terms" per i testi dei Termini e "co2" per i testi relativi al CO₂
  const { t } = useTranslation('terms');
  const { t: tCo2 } = useTranslation('co2');

  return (
    <DefaultLayout>
      {/* Rende il container "relative" per posizionare il selettore in alto a destra */}
      <section className="relative container mx-auto px-4 py-8">
        {/* Selettore lingua posizionato in alto a destra */}
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>

        {/* Contenuto Termini */}
        <div className="text-center mb-8">
          <h1 className={`${title()} font-bold`}>{t('pageTitle')}</h1>
          <h2 className={`${subtitle()} font-bold`}>{t('pageSubtitle')}</h2>
        </div>
        <article className="prose lg:prose-xl bg-white text-black p-4 text-center">
          {[...Array(18)].map((_, idx) => {
            const section = idx + 1;
            return (
              <section key={section} className="mb-8">
                <h2 className="font-bold">{t(`section${section}Title`)}</h2>
                <div className="mb-4"></div>
                <div className="text-center">
                  <ReactMarkdown>{t(`section${section}Content`)}</ReactMarkdown>
                </div>
              </section>
            );
          })}
        </article>
      </section>
    </DefaultLayout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  console.log("GetStaticProps Locale:", locale);
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'it', ['terms', 'co2'])),
    },
  };
};

export default TermsPage;
