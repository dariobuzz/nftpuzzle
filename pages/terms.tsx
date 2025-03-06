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
      <section className="container mx-auto px-4 py-8">
        {/* Selettore lingua */}
   

        {/* Contenuto Termini */}
        <div className="text-center mb-8">
          <h1 className={`${title()} font-bold`}>{t('pageTitle')}</h1>
          <h2 className={`${subtitle()} font-bold`}>{t('pageSubtitle')}</h2>
        </div>
        <article className="prose lg:prose-xl bg-white text-black p-4 text-center">
          <section className="mb-8">
            <h2 className="font-bold">{t('section1Title')}</h2>
            <div className="mb-4"></div>
            <div className="text-center">
              <ReactMarkdown>{t('section1Content')}</ReactMarkdown>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-bold">{t('section2Title')}</h2>
            <div className="mb-4"></div>
            <div className="text-center">
              <ReactMarkdown>{t('section2Content')}</ReactMarkdown>
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
            <div className="text-center">
              <ReactMarkdown>{t('section4Content')}</ReactMarkdown>
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


        {/* Nova estrutura para a compensação de CO₂ */}
<section>
  <div className="text-center mb-8 mt-12">
    <h1 className={`${title()} font-bold`}>{tCo2('pageTitle')}</h1>
    <h2 className={`${subtitle()} font-bold`}>{tCo2('pageSubtitle')}</h2>
  </div>
  <article className="prose lg:prose-xl bg-white text-black p-4 text-center">
    <section className="mb-8">
      <h2 className="font-bold">{tCo2('section1Title')}</h2>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section1Content')}</ReactMarkdown>
      </div>
    </section>

    <section className="mb-8">
      <h2 className="font-bold">{tCo2('section2Title')}</h2>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section2_1Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section2_1Content')}</ReactMarkdown>
      </div>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section2_2Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section2_2Content')}</ReactMarkdown>
      </div>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section2_3Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section2_3Content')}</ReactMarkdown>
      </div>
    </section>

    <section className="mb-8">
      <h2 className="font-bold">{tCo2('section3Title')}</h2>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section3_1Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section3_1Content')}</ReactMarkdown>
      </div>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section3_2Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section3_2Content')}</ReactMarkdown>
      </div>
    </section>

    <section className="mb-8">
      <h2 className="font-bold">{tCo2('section4Title')}</h2>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section4_1Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section4_1Content')}</ReactMarkdown>
      </div>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section4_2Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section4_2Content')}</ReactMarkdown>
      </div>
    </section>

    <section className="mb-8">
      <h2 className="font-bold">{tCo2('section5Title')}</h2>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section5_1Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section5_1Content')}</ReactMarkdown>
      </div>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section5_2Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section5_2Content')}</ReactMarkdown>
      </div>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section5_3Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section5_3Content')}</ReactMarkdown>
      </div>
    </section>

    <section className="mb-8">
      <h2 className="font-bold">{tCo2('section6Title')}</h2>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section6_1Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section6_1Content')}</ReactMarkdown>
      </div>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section6_2Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section6_2Content')}</ReactMarkdown>
      </div>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section6_3Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section6_3Content')}</ReactMarkdown>
      </div>
    </section>

    <section className="mb-8">
      <h2 className="font-bold">{tCo2('section7Title')}</h2>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section7_1Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section7_1Content')}</ReactMarkdown>
      </div>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section7_2Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section7_2Content')}</ReactMarkdown>
      </div>
    </section>

    <section className="mb-8">
      <h2 className="font-bold">{tCo2('section8Title')}</h2>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section8_1Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section8_1Content')}</ReactMarkdown>
      </div>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section8_2Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section8_2Content')}</ReactMarkdown>
      </div>
      <div className="mb-4" />
      <h3 className="font-bold">{tCo2('section8_3Title')}</h3>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section8_3Content')}</ReactMarkdown>
      </div>
    </section>

    <section className="mb-8">
      <h2 className="font-bold">{tCo2('section9Title')}</h2>
      <div className="mb-4" />
      <div className="text-center">
        <ReactMarkdown>{tCo2('section9Content')}</ReactMarkdown>
      </div>
    </section>
  </article>
</section>


<LanguageSelector />
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
