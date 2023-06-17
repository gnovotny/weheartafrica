export const ENTER_TWEEN_TYPE = 'enter' // datum not in first data, but in last data; adds a cell to the first Voronoï tessellation
export const UPDATE_TWEEN_TYPE = 'update' // datum in first data and in last data; the corresponding cell in first Voronoï tessellation evolves
export const EXIT_TWEEN_TYPE = 'exit' // datum in first data, but not in last data; deletes a cell from the first Voronoï tessellation

export const DEFAULT_IDENTIFIER_ACCESSOR = function (d) {
  return d.id
} // datum identified with its 'id' attribute
export const INTERPOLATED_X_ACCESSOR = function (site) {
  return site.interpolatedSiteX
} // x-accessor of interpolated site
export const INTERPOLATED_Y_ACCESSOR = function (site) {
  return site.interpolatedSiteY
} // y-accessor of interpolated site
export const INTERPOLATED_WEIGHT_ACCESSOR = function (site) {
  return site.interpolatedSiteWeight
} // weight-accessor of interpolated site
