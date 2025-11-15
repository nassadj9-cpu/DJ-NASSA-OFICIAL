<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBVTCCnBsfZMRlxlJfQLDR1oc9dAzuN_qc",
    authDomain: "dj-nassa.firebaseapp.com",
    projectId: "dj-nassa",
    storageBucket: "dj-nassa.firebasestorage.app",
    messagingSenderId: "74937447758",
    appId: "1:74937447758:web:52ca0e15280920962e5a1f",
    measurementId: "G-TQBSY2S126"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>