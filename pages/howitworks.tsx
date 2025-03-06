import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import DefaultLayout from '@/layouts/default';
import { title, subtitle } from '@/components/primitives';
import ReactMarkdown from 'react-markdown';
import LanguageSelector from '@/components/selector';

const RegolamentoPage = () => {
  const { t } = useTranslation('common');

  return (
    <DefaultLayout>
      <section className="container mx-auto px-4 py-8">
        {/* Selettore lingua */}
        

        {/* Titolo e sottotitolo centrati */}
        <div className="text-center mb-8">
          <h1 className={`${title()} font-bold`}>{t('pageTitle')}</h1>
          <h2 className={`${subtitle()} font-bold`}>{t('pageSubtitle')}</h2>
        </div>

        {/* Contenuto strutturato in sezioni, reso con markdown */}
        <article className="prose lg:prose-xl bg-white text-black p-4 text-center">
          <section className="mb-8">
            <h2 className="font-bold">{t('section1Title')}</h2>
            <div className="mb-4"></div>
            <h3 className="font-bold">{t('section1_1Title')}</h3>
            <div className="mb-4"></div>
            <div className="text-center">
              <ReactMarkdown>{t('section1_1Content')}</ReactMarkdown>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-bold">{t('section2Title')}</h2>
            <div className="mb-4"></div>
            <h3 className="font-bold">{t('section2_1Title')}</h3>
            <div className="mb-4"></div>
            <div className="text-center">
              <ReactMarkdown>{t('section2_1Content')}</ReactMarkdown>
            </div>
            <div className="mb-4"></div>
            <h3 className="font-bold">{t('section2_2Title')}</h3>
            <div className="mb-4"></div>
            <div className="text-center">
              <ReactMarkdown>{t('section2_2Content')}</ReactMarkdown>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-bold">{t('section3Title')}</h2>
            <div className="mb-4"></div>
            <div className="text-center">
              <ReactMarkdown>{t('section3Content')}</ReactMarkdown>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-bold">{t('section4Title')}</h2>
            <div className="mb-4"></div>
            <h3 className="font-bold">{t('section4_1Title')}</h3>
            <div className="mb-4"></div>
            <div className="text-center">
              <ReactMarkdown>{t('section4_1Content')}</ReactMarkdown>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-bold">{t('section5Title')}</h2>
            <div className="mb-4"></div>
            <div className="text-center">
              <ReactMarkdown>{t('section5Content')}</ReactMarkdown>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-bold">{t('section6Title')}</h2>
            <div className="mb-4"></div>
            <div className="text-center">
              <ReactMarkdown>{t('section6Content')}</ReactMarkdown>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-bold">{t('section7Title')}</h2>
            <div className="mb-4"></div>
            <div className="text-center">
              <ReactMarkdown>{t('section7Content')}</ReactMarkdown>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-bold">{t('section8Title')}</h2>
            <div className="mb-4"></div>
            <div className="text-center">
              <ReactMarkdown>{t('section8Content')}</ReactMarkdown>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-bold">{t('section9Title')}</h2>
            <div className="mb-4"></div>
            <div className="text-center">
              <ReactMarkdown>{t('section9Content')}</ReactMarkdown>
            </div>
          </section>
        </article>
        <LanguageSelector />
      </section>
    </DefaultLayout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  console.log("GetStaticProps Locale:", locale);

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'it', ['common'])),
    },
  };
};

export default RegolamentoPage;
