export const G_ID = 'TODO'

export const pageview = (url: string) => {
  ;(window as any).dataLayer.push({
    event: 'pageview',
    page: url,
  })
}
