<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>Motokah — Sitemap</title>
        <meta name="robots" content="noindex,follow"/>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
          header { background: #0066CC; color: white; padding: 20px 32px; }
          header h1 { margin: 0; font-size: 1.4rem; font-weight: 800; }
          header p { margin: 4px 0 0; font-size: 0.85rem; opacity: 0.8; }
          .container { max-width: 960px; margin: 32px auto; padding: 0 16px; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          th { background: #0066CC; color: white; text-align: left; padding: 10px 16px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
          td { padding: 10px 16px; border-bottom: 1px solid #e2e8f0; font-size: 0.85rem; }
          tr:last-child td { border-bottom: none; }
          tr:hover td { background: #f1f5f9; }
          a { color: #0066CC; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .count { display: inline-block; background: #0066CC; color: white; padding: 2px 10px; border-radius: 99px; font-size: 0.8rem; margin-left: 8px; }
        </style>
      </head>
      <body>
        <header>
          <h1>Motokah — XML Sitemap</h1>
          <p><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs indexed
            · <a href="https://www.motokah.com" style="color:white">motokah.com</a></p>
        </header>
        <div class="container">
          <table>
            <tr>
              <th>URL</th>
              <th>Last Modified</th>
              <th>Change Freq</th>
              <th>Priority</th>
            </tr>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <tr>
                <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                <td><xsl:value-of select="sitemap:lastmod"/></td>
                <td><xsl:value-of select="sitemap:changefreq"/></td>
                <td><xsl:value-of select="sitemap:priority"/></td>
              </tr>
            </xsl:for-each>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
