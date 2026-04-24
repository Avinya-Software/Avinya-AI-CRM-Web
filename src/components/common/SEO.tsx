import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string;
  twitterCard?: string;
}

const SEO = ({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogType = 'website',
  ogImage,
  twitterCard = 'summary_large_image',
}: SEOProps) => {
  const siteTitle = 'Avinya AI CRM';
  const fullTitle = `${title} | ${siteTitle}`;
  const defaultDescription = 'Avinya AI CRM - The most intelligent customer management system powered by AI. Automate your leads, tasks, and sales with ease.';
  const defaultKeywords = 'AI CRM, customer management, sales automation, AI sales assistant, CRM evolution, Avinya AI';
  const defaultImage = 'https://aicrm.avinyasoftware.com/Images/og-image.png'; // Fallback to CRM OG image

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description || defaultDescription} />
      <meta property="og:image" content={ogImage || defaultImage} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      <meta name="twitter:description" content={ogDescription || description || defaultDescription} />
      <meta name="twitter:image" content={ogImage || defaultImage} />
    </Helmet>
  );
};

export default SEO;
