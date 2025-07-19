// services/resourceService.js
const API_URL = "http://localhost:5173/api/Recurso"; // ou o teu URL real da API

export const getAllResources = async () => {
  const response = await fetch(API_URL);
  return response.json();
};

export const getResourceById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  return response.json();
};

export const createResource = async (resource) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resource),
  });
  return response.json();
};

export const updateResource = async (id, resource) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resource),
  });
  return response.ok;
};

export const deleteResource = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  return response.ok;
};

export const getAvailability = async (id) => {
  const response = await fetch(`${API_URL}/disponibilidade/${id}`);
  return response.json();
};

export const updateAvailability = async (id, disponibilidade) => {
  const response = await fetch(`${API_URL}/disponibilidade/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(disponibilidade),
  });
  return response.text();
};
