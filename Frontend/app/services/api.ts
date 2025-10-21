import axios from "axios";

const api = axios.create({
 
  baseURL: 'https://gerenciamentoassociacao2025.onrender.com',
  
});

export const CLOUDFLARE_R2_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL || 'https://pub-c5a813e903524beb8500fe1fd3de9efe.r2.dev/';

export default api;
