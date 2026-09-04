import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object;
}

export const SEO = ({
  title = 'UTP Alumni Business Directory',
  description = 'Discover businesses owned by UTP alumni. Connect with entrepreneurs and professionals from Universiti Teknologi PETRONAS.',
  canonical,
  ogImage = 'https://utpalumni.org/abud/og-image.svg',
  ogType = 'website',
  structuredData,
}: SEOProps) => {
  const baseUrl = 'https://utpalumni.org/abud';
  const fullUrl = canonical ? `${baseUrl}${canonical}` : baseUrl;

  // Default Organization structured data
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'UTP Alumni Business Directory',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.svg`,
        },
        description: 'Connect with thousands of UTP alumni and discover alumni-owned businesses worldwide',
        sameAs: [
          'https://twitter.com/UTPAlumni',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'UTP Alumni Business Directory',
        description: 'Discover businesses owned by UTP alumni. Connect with entrepreneurs and professionals from Universiti Teknologi PETRONAS.',
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/directory/alumni?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="UTP Alumni Business Directory" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@UTPAlumni" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};
