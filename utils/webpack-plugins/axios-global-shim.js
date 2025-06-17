import axios from "axios";

if (typeof window !== "undefined") {
  window.axios = axios;
  
}

export default axios;
