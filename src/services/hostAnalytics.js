import axios from 'axios';

const API_BASE_URL = 'http://46.202.166.150:8081/admin/analytics';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJVU0VSX0lEIjoyMCwic3ViIjoiOTk5OTk5OTk5OSIsImlhdCI6MTc1MTI5ODYwMCwiZXhwIjoxNzUxOTAzNDAwfQ.GtCSCtNETuGemDnmp9tX0wFAiURjlnCURfxi0nKAhkc';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': AUTH_TOKEN,
    'Content-Type': 'application/json'
  }
});

export const getHostsSummary = async (startDate, endDate) => {
  try {
    const response = await api.get(`/hosts/summary?startDate=${startDate}&endDate=${endDate}`);
    return response.data.response;
  } catch (error) {
    console.error('Error fetching hosts summary:', error);
    throw error;
  }
};

export const getHostDetails = async (hostId) => {
  try {
    const response = await api.get(`/hosts/${hostId}/details`);
    return response.data.response;
  } catch (error) {
    console.error('Error fetching host details:', error);
    throw error;
  }
};

export const getHostCarsAnalytics = async (hostId, startDate, endDate) => {
  try {
    const response = await api.get(`/hosts/${hostId}/cars?startDate=${startDate}&endDate=${endDate}`);
    return response.data.response;
  } catch (error) {
    console.error('Error fetching host cars analytics:', error);
    throw error;
  }
};

export const getHostBookingsAnalytics = async (hostId, startDate, endDate) => {
  try {
    const response = await api.get(`/hosts/${hostId}/bookings?startDate=${startDate}&endDate=${endDate}`);
    return response.data.response;
  } catch (error) {
    console.error('Error fetching host bookings analytics:', error);
    throw error;
  }
};

export const getHostListingsAnalytics = async (hostId, startDate, endDate) => {
  try {
    const response = await api.get(`/hosts/${hostId}/listings?startDate=${startDate}&endDate=${endDate}`);
    return response.data.response;
  } catch (error) {
    console.error('Error fetching host listings analytics:', error);
    throw error;
  }
};