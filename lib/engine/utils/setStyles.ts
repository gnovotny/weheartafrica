export const setStyles = (element: HTMLElement, styles: { [key: string]: string }): void => {
  if (styles !== undefined) {
    Object.keys(styles).forEach((key: string) => {
      element.style.setProperty(key, styles[key])
    })
  }
}
