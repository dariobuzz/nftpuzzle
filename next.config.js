/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  staticPageGenerationTimeout: 120, // aumenta il timeout a 120 secondi (default è 60)
  reactStrictMode: true,
  i18n,  // Aggiungi la configurazione per il multilingua
};

module.exports = nextConfig;
