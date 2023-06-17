const Hamburger = ({ className = '', ...props }) => (
  <svg
    viewBox='0 0 47.25 47.25'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
    {...props}
  >
    {/*<rect*/}
    {/*  vectorEffect="non-scaling-stroke"*/}
    {/*  shapeRendering="crispEdges"*/}
    {/*  className="cls-1" width="488.89" height="132.13" />*/}
    {/*<rect*/}
    {/*  vectorEffect="non-scaling-stroke"*/}
    {/*  shapeRendering="crispEdges"*/}
    {/*  className="cls-1" y="189.93" width="488.89" height="132.13" />*/}
    {/*<rect*/}
    {/*  vectorEffect="non-scaling-stroke"*/}
    {/*  shapeRendering="crispEdges"*/}
    {/*  className="cls-1" y="379.87" width="488.89" height="132.13" />*/}
    <line
      strokeWidth={8}
      y1='10.13'
      x2='47.25'
      y2='10.13'
    />
    <line
      strokeWidth={8}
      y1='23.63'
      x2='47.25'
      y2='23.63'
    />
    <line
      strokeWidth={8}
      y1='37.13'
      x2='47.25'
      y2='37.13'
    />
  </svg>
)

export default Hamburger
