import axios from "axios";

const api = axios.create({
 
  baseURL: 'https://gerenciamentoassociacao2025.onrender.com',
  
});

export default api;
