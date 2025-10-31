// all the API endpoints in one place
export const API_ENDPOINTS = {
  FILES: "/files",
  UPLOAD: "/files/upload",
  DOWNLOAD: (id) => `/files/${id}/download`,
  VIEW: (id) => `/files/${id}/view`,
  DELETE: (id) => `/files/${id}`,
};

