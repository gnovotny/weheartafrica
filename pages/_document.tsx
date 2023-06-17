import Document, { Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                var consoleInfo = console.info
                console.info = function (message) {
                  if (!/Download the React DevTools/.test(message)) consoleInfo.apply(console, arguments)
                }
            `,
            }}
          />
        </Head>
        <body className='loading'>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
