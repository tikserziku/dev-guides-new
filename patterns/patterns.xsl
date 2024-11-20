<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="/">
        <html>
            <head>
                <style>
                    body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; }
                    .pattern { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                    pre { background: #f5f5f5; padding: 10px; border-radius: 3px; }
                </style>
            </head>
            <body>
                <h1>Development Patterns</h1>
                <xsl:for-each select="//pattern">
                    <div class="pattern">
                        <h2><xsl:value-of select="@id"/></h2>
                        <p><xsl:value-of select="description"/></p>
                        <pre><xsl:value-of select="code"/></pre>
                    </div>
                </xsl:for-each>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
