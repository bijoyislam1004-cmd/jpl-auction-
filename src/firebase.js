updated firebase config
  import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyD_7Rc0UTYZZbGZhnoPnnv73aEH6G3tCp0",
  authDomain: "jpl2026.firebaseapp.com",
  projectId: "jpl2026",
  storageBucket: "jpl2026.firebasestorage.app",
  messagingSenderId: "244509159357",
  appId: "1:244509159357:web:b6849d92c4d84731812cd4"
};

const app = initializeApp(firebaseConfig);
export default app;
