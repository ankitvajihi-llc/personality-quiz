import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <title>Bohri Cupid Personality Test</title>
        <meta
          name="description"
          content="What type of Bohra are you? Take the Bohri Cupid Personality Test and find out."
        />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://quiz.bohricupid.com" />
        <meta
          property="og:title"
          content="Bohri Cupid Personality Test"
        />
        <meta
          property="og:description"
          content="What type of Bohra are you? Take the Bohri Cupid Personality Test and find out."
        />
        <meta
          property="og:image"
          content="https://quiz.bohricupid.com/og-image.png"
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Bohri Cupid Personality Test"
        />
        <meta
          name="twitter:description"
          content="What type of Bohra are you? Take the Bohri Cupid Personality Test and find out."
        />
        <meta
          name="twitter:image"
          content="https://quiz.bohricupid.com/og-image.png"
        />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
