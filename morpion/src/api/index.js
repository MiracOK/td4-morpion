import axios from 'axios'

const baseURL = "https://morpion-api.edu.netlor.fr";
const moveWsURL = "https://morpion-api.edu.netlor.fr/websockets";
const keys = ["sjpa}YGYL_SU"];

let key = null;
let api = null;
const setKey = (k) => {
    console.log('api key set to %s', k)
    key = k;
}
api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': `application/json`,
        'Authorization': `key=sjpa}YGYL_SU`
    }
})

export default api