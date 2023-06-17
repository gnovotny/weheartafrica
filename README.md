
## Description

An experimental website. The project is abandoned, incomplete, buggy, non-performant and the code is messy and unoptimized.

Because a GIF is worth a thousand words:

[![We <3 Africa](./weheartafrica_presentation.gif)](https://weheartafrica.vercel.app)


## Composition

Employed libraries include:

- [React](https://react.dev/) -> front-end JavaScript library
- [Next.js](https://nextjs.org) -> web development framework for react
- [Tailwind](https://tailwindcss.com/) -> utility-first CSS framework
- [Jotai](https://github.com/pmndrs/jotai) -> state-management solution for react
- [Framer Motion](https://www.framer.com/motion/) -> animation library for react
- [PixiJS](https://github.com/pixijs/pixijs) -> 2D WebGL renderer.

## Features

- experimental reactive layout that is computed and animated using voronoi tessellations

## Running Locally

This application requires Node.js v14+.

```bash
git clone https://github.com/gnovotny/weheartafrica.git
cd weheartafrica
yarn install
yarn dev
```

## Acknowledgements
- [LEBEAU Frank](https://github.com/Kcnarf) for his work on voronoi diagrams
- Modded version of [d3-voronoi-map](https://github.com/Kcnarf/d3-voronoi-map) included in the source code [LICENSE](https://github.com/Kcnarf/d3-voronoi-map/blob/master/LICENSE)
- Modded version of [d3-weighted-voronoi](https://github.com/Kcnarf/d3-weighted-voronoi) included in the source code [LICENSE](https://github.com/Kcnarf/d3-weighted-voronoi/blob/master/LICENSE)
- Modded version of [jsclipper](https://sourceforge.net/p/jsclipper) included in the source code [LICENSE](https://sourceforge.net/p/jsclipper/wiki/Home%206/#licence)
- Modded version of [locomotive-scroll](https://github.com/locomotivemtl/locomotive-scroll) included in the source code [LICENSE](https://github.com/locomotivemtl/locomotive-scroll/blob/master/LICENSE)

## License

[The MIT License](https://opensource.org/licenses/MIT)


