export class LayoutSimulator {
  render() {
    return `
      <html theme="light" platform="web" lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="menu:exclude" content="true" />
          <meta charset="utf-8" />
          <style type="text/css">
            body {
              margin: 0;
              height: fit-content;
            }
            html[edge-distance] body {
              padding: 8px;
            }
          </style>
          <script type="module">
            import { render } from '@mdjs/mdjs-story';

            function sanitize(input, type) {
              console.log('sanitize', input, type);
              return \`\${document.location.origin}/\${
                input.match(/[a-zA-Z0-9-_\\/]*/)[0]
              }.\${type}\`;
            }

            async function onHashChange() {
              const urlParts = new URLSearchParams(document.location.hash.substr(1));

              if (urlParts.get('stylesheets')) {
                for (const stylesheet of urlParts.getAll('stylesheets')) {
                  const safeStylesheetUrl = sanitize(stylesheet, 'css');
                  if (
                    !document.querySelector(
                      \`link[rel="stylesheet"][href="\${safeStylesheetUrl}"]\`,
                    )
                  ) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = safeStylesheetUrl;
                    document.head.appendChild(link);
                  }
                }
              }

              if (urlParts.get('moduleUrls')) {
                for (const moduleUrl of urlParts.getAll('moduleUrls')) {
                  const safeModuleUrl = sanitize(moduleUrl, 'js');
                  if (!document.querySelector(\`script[type=module][src="\${safeModuleUrl}"]\`)) {
                    const script = document.createElement('script');
                    script.type = 'module';
                    script.src = safeModuleUrl;
                    document.head.appendChild(script);
                  }
                }
              }

              if (urlParts.get('theme')) {
                document.documentElement.setAttribute('theme', urlParts.get('theme'));
              }
              if (urlParts.get('platform')) {
                document.documentElement.setAttribute('platform', urlParts.get('platform'));
              }
              if (urlParts.get('language')) {
                document.documentElement.setAttribute('lang', urlParts.get('language'));
                document.documentElement.setAttribute('data-lang', urlParts.get('language'));
              }
              if (urlParts.get('story-key')) {
                document.documentElement.setAttribute('story-key', urlParts.get('story-key'));
              }
              if (urlParts.get('edge-distance') === 'true') {
                document.documentElement.setAttribute('edge-distance', '');
              } else {
                document.documentElement.removeAttribute('edge-distance');
              }

              const safeStoryUrl = sanitize(urlParts.get('story-file'), 'js');
              const mod = await import(safeStoryUrl);
              render(mod[urlParts.get('story-key')]({ shadowRoot: document }), document.body);
            }

            window.addEventListener('hashchange', onHashChange, false);
            onHashChange();

            const observer = new ResizeObserver(() => {
              const dimensions = document.body.getBoundingClientRect();
              const data = {
                action: 'mdjs-viewer-resize',
                storyKey: document.documentElement.getAttribute('story-key'),
                width: dimensions.width,
                height: dimensions.height,
              };
              parent.postMessage(data, '*');
            });
            observer.observe(document.body);
          </script>
        </head>
        <body></body>
      </html>
    `;
  }
}
