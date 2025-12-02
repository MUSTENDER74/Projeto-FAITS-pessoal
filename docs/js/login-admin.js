// =========================
// 🔥 IMPORTAÇÕES DO FIREBASE
// =========================
import { db } from "./firebase-config.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// =========================
// 📌 FORM DO LOGIN ADMIN
// =========================
const form = document.getElementById("loginMasterForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const ra = document.getElementById("login-ra").value.trim();
  const senha = document.getElementById("login-senha").value.trim();

  if (!ra || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    // 🔎 Busca no caminho correto do Realtime Database
    const adminRef = ref(db, `admin/${ra}`);
    const snapshot = await get(adminRef);

    if (!snapshot.exists()) {
      alert("RA não encontrado!");
      return;
    }

    const dados = snapshot.val();

    if (dados.senha !== senha) {
      alert("Senha incorreta!");
      return;
    }

    // ==============================
    // 🔥 LOGIN DO ADMINISTRADOR
    // ==============================
    localStorage.setItem(
      "usuarioLogado",
      JSON.stringify({
        ra: ra,
        tipo: "admin",
        nome: dados.nome || "Administrador",
      })
    );

    alert("Login realizado com sucesso!");
    window.location.href = "perfil.html";
  } catch (error) {
    console.error("Erro ao acessar o banco:", error);
    alert("Erro ao acessar o banco de dados. Veja o console.");
  }
});
