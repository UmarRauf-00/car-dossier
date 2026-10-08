// URL of a model's report page, e.g. /vehicle/honda/Civic/2015
export const vehiclePath = (make: string, model: string, year: number) =>
  `/vehicle/${encodeURIComponent(make.toLowerCase())}/${encodeURIComponent(model)}/${year}`;
