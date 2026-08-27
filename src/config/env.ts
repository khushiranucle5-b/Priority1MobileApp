declare const process: any;

export const GOOGLE_MAPS_API_KEY: string =
  (typeof process !== 'undefined' && process?.env?.GOOGLE_MAPS_API_KEY) ||
  (typeof process !== 'undefined' && process?.env?.REACT_APP_GOOGLE_MAPS_API_KEY) ||
  'AIzaSyAl_rYWyYkPlDWbWiPuMg-SzrpPo11BiuY';
