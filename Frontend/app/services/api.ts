import axios from "axios";

const api = axios.create({
 
  baseURL: 'https://gerenciamentoassociacao-api.onrender.com'
  
});

export default api;
