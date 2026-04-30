import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

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
  schema?: Record<string, unknown> | Record<string, unknown>[];
}

const siteUrl = 'https://aicrm.avinyasoftware.com';
const siteTitle = 'Avinya AI CRM';
const defaultDescription = 'Avinya AI CRM - The most intelligent customer management system powered by AI. Automate your leads, tasks, and sales with ease.';
const defaultKeywords = 'AI CRM, customer management, sales automation, AI sales assistant, CRM evolution, Avinya AI';
const defaultImage = `${siteUrl}/Images/og-image.png`;

const publicNavigation = [
  { name: 'Home', url: `${siteUrl}/` },
  { name: 'About', url: `${siteUrl}/about` },
  { name: 'Features', url: `${siteUrl}/features` },
  { name: 'Book Demo', url: `${siteUrl}/booking` },
  { name: 'Login', url: `${siteUrl}/login` },
  { name: 'Sign up', url: `${siteUrl}/signup` },
];

const routeNames: Record<string, string> = {
  '/': 'Home',
  '/about': 'About',
  '/features': 'Features',
  '/booking': 'Book Demo',
  '/login': 'Login',
  '/signup': 'Sign up',
};

const getRouteName = (pathname: string) => {
  if (routeNames[pathname]) return routeNames[pathname];

  return pathname
    .split('/')
    .filter(Boolean)
    .pop()
    ?.split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Page';
};

const createBreadcrumbSchema = (pathname: string, canonicalUrl: string) => {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${siteUrl}/`,
    },
  ];

  if (pathname !== '/') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: getRouteName(pathname),
      item: canonicalUrl,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
};

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
  schema,
}: SEOProps) => {
  const location = useLocation();
  const fullTitle = `${title} | ${siteTitle}`;
  const pageDescription = description || defaultDescription;
  const pageImage = ogImage || defaultImage;
  const pathname = location.pathname === '/' ? '/' : location.pathname.replace(/\/$/, '');
  const canonicalUrl = canonical || `${siteUrl}${pathname === '/' ? '/' : pathname}`;
  const extraSchema = schema ? (Array.isArray(schema) ? schema : [schema]) : [];
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: fullTitle,
      description: pageDescription,
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: siteTitle,
        url: `${siteUrl}/`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SiteNavigationElement',
      name: publicNavigation.map((item) => item.name),
      url: publicNavigation.map((item) => item.url),
    },
    createBreadcrumbSchema(pathname, canonicalUrl),
    ...extraSchema,
  ];

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || pageDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={pageImage} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      <meta name="twitter:description" content={ogDescription || pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
