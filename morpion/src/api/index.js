import axios from 'axios'
import key from '../../config.json'


const baseURL = "https://morpion-api.edu.netlor.fr";
const moveWsURL = "https://morpion-api.edu.netlor.fr/websockets";
const apiKey = key.VITE_API_KEY;

let api = null;
api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': `application/json`,
        'Authorization': `key=${apiKey}`
    }
})

export default api