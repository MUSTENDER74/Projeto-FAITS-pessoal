import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHYcGGuJna46eaJ11_B1EIaJ3WH31MAQw",
  authDomain: "etec-caba3.firebaseapp.com",
  databaseURL: "https://etec-caba3-default-rtdb.firebaseio.com",
  projectId: "etec-caba3",
  storageBucket: "etec-caba3.firebasestorage.app",
  messagingSenderId: "21789656493",
  appId: "1:21789656493:web:609fb7df4a3ed4e4e90d24",
  measurementId: "G-RKKZH5R365",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { app, db, auth };
