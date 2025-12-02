// ===== IMPORTS FIREBASE =====
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

import { app } from "./firebase-config.js";

// Inicializações
const auth = getAuth(app);
const db = getDatabase(app);

// ===== DOM =====
const botoesAbrir = document.querySelectorAll(".js-abrir-form");
const btnCancelar = document.getElementById("btn-cancelar");
const formSection = document.getElementById("add-professor-section");
const formCadastro = document.getElementById("professor-form");

// ===== Mostrar / Ocultar Formulário =====
botoesAbrir.forEach((botao) => {
  botao.addEventListener("click", () => {
    formSection.classList.remove("hidden");
  });
});

btnCancelar.addEventListener("click", () => {
  formSection.classList.add("hidden");
});

// ===== CADASTRAR PROFESSOR =====
formCadastro.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("form-nome").value.trim();
  const email = document.getElementById("form-email").value.trim();
  const ra = document.getElementById("form-ra").value.trim();

  if (!nome || !email || !ra) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const senhaTemporaria = Math.random().toString(36).slice(-10);

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      senhaTemporaria
    );

    const uid = userCredential.user.uid;

    await set(ref(db, "professores/" + uid), {
      nome,
      email,
      ra,
      uid,
    });

    await sendPasswordResetEmail(auth, email);

    alert(
      "Professor cadastrado com sucesso!\nUm email foi enviado para redefinir a senha."
    );

    formCadastro.reset();
    formSection.classList.add("hidden");
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    alert("Erro ao cadastrar professor: " + error.message);
  }
});
