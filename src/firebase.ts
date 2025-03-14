import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Din Firebase-konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyC5q3No3VQt2sql-a-hi8Wzmhw85fl188s",
  authDomain: "akram-94331.firebaseapp.com",
  databaseURL: "https://akram-94331-default-rtdb.europe-west1.firebasedatabase.app/", 
  projectId: "akram-94331",
  storageBucket: "akram-94331.appspot.com",
  messagingSenderId: "743067451267",
  appId: "1:743067451267:web:dd4f5fc65c804e063a40b6",
  measurementId: "G-YH2L3G0CBP"
};

// Initiera Firebase
const app = initializeApp(firebaseConfig);

// Initiera Realtime Database
const db = getDatabase(app);

// Exportera `db` så du kan använda det i andra filer
export { db };
