// =========================
// 🔥 IMPORTAÇÕES DO FIREBASE
// =========================
import { db } from "./firebase-config.js";
import {
  ref,
  set,
  get,
  child,
  remove,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// =========================
// 🔐 CRIPTOGRAFIA DE SENHAS (SHA-256)
// =========================
async function hashSenha(senha) {
  const encoder = new TextEncoder();
  const data = encoder.encode(senha);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

async function compararSenha(senhaDigitada, senhaHash) {
  const hashDigitada = await hashSenha(senhaDigitada);
  return hashDigitada === senhaHash;
}

// =========================
// 🌐 SELETORES DAS SEÇÕES
// =========================
const loginSection = document.getElementById("loginSection");
const profileSection = document.getElementById("profileSection");
const editProfileSection = document.getElementById("editProfileSection");

const loginForm = document.getElementById("loginForm");
const profileForm = document.getElementById("profileForm");

// =========================
// 🔄 TROCAR ENTRE LOGIN E CRIAR CONTA
// =========================
document.querySelectorAll("[data-section]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-section");
    loginSection.style.display = target === "login" ? "block" : "none";
    profileSection.style.display = target === "profile" ? "block" : "none";
    editProfileSection.style.display = "none";
  });
});

// =========================
// 🧾 CRIAR CONTA (apenas alunos)
// =========================
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("new-username").value.trim();
  const ra = document.getElementById("new-ra").value.trim();
  const curso = document.getElementById("new-curso").value.trim();
  const email = document.getElementById("new-email").value.trim();
  const senha = document.getElementById("new-password").value.trim();
  const confirmSenha = document.getElementById("confirm-password").value.trim();

  if (!username || !ra || !curso || !email || !senha || !confirmSenha) {
    alert("Todos os campos são obrigatórios!");
    return;
  }

  if (senha !== confirmSenha) {
    alert("As senhas não coincidem!");
    return;
  }

  try {
    const dbRef = ref(db);

    // Verifica se o RA já existe
    const raSnapshot = await get(child(dbRef, `alunos/${ra}`));
    if (raSnapshot.exists()) {
      alert("Esse RA já está cadastrado!");
      return;
    }

    // Criptografa a senha
    const senhaHash = await hashSenha(senha);

    // Salva no Realtime Database
    await set(ref(db, `alunos/${ra}`), {
      ra,
      username,
      curso,
      email,
      senhaHash,
    });

    alert("Conta criada com sucesso!");

    // Volta para o login
    profileForm.reset();
    profileSection.style.display = "none";
    loginSection.style.display = "block";
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    alert("Erro ao criar conta. Verifique o console.");
  }
});

// =========================
// 🔑 LOGIN (RA + Senha + Tipo)
// =========================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const tipoLogin = document.getElementById("login-tipo")?.value || "alunos";
  const ra = document.getElementById("login-ra").value.trim();
  const senha = document.getElementById("password").value.trim();
  const lembrar = document.getElementById("lembrarLogin")?.checked;

  if (!ra || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `${tipoLogin}/${ra}`));

    if (!snapshot.exists()) {
      alert("RA não encontrado!");
      return;
    }

    const dados = snapshot.val();
    const senhaCorreta = await compararSenha(senha, dados.senhaHash);

    if (!senhaCorreta) {
      alert("Senha incorreta!");
      return;
    }

    // salva o RA SEMPRE
    localStorage.setItem("raLogado", dados.ra);

    // Se o usuário quiser, salva o login no localStorage
    if (lembrar) {
      localStorage.setItem(
        "usuarioLogado",
        JSON.stringify({
          tipo: tipoLogin,
          ra: dados.ra,
          username: dados.username,
          email: dados.email,
          curso: dados.curso,
        })
      );
    }

    mostrarPerfil(dados);
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    alert("Erro ao fazer login. Verifique o console.");
  }
});

// =========================
// 💾 AUTOLOGIN - recuperar usuário salvo
// =========================
document.addEventListener("DOMContentLoaded", async () => {
  const usuarioSalvo = localStorage.getItem("usuarioLogado");
  if (usuarioSalvo) {
    const dados = JSON.parse(usuarioSalvo);

    // Busca informações atualizadas no banco
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `${dados.tipo}/${dados.ra}`));
    if (snapshot.exists()) {
      mostrarPerfil(snapshot.val());
    } else {
      localStorage.removeItem("usuarioLogado");
    }
  }
});

// =========================
// 🧍 FUNÇÃO PARA MOSTRAR PERFIL
// =========================
function mostrarPerfil(dados) {
  loginSection.style.display = "none";
  profileSection.style.display = "none";
  editProfileSection.style.display = "block";

  document.getElementById("displayUsername").textContent = dados.username;
  document.getElementById("displayEmail").textContent = dados.email;
  document.getElementById("displayRA").textContent = dados.ra;
  document.getElementById("displayCurso").textContent = dados.curso;
}

// =========================
// 🚪 SAIR
// =========================
document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("usuarioLogado");

  editProfileSection.style.display = "none";
  loginSection.style.display = "block";

  alert("Você saiu da conta!");
});

// =========================
// 🗑️ APAGAR CONTA
// =========================
document
  .getElementById("deleteAccountButton")
  .addEventListener("click", async () => {
    const ra = document.getElementById("displayRA").textContent;
    if (!confirm("Tem certeza que deseja apagar sua conta?")) return;

    try {
      await remove(ref(db, `alunos/${ra}`));
      localStorage.removeItem("usuarioLogado");

      alert("Conta apagada com sucesso!");
      editProfileSection.style.display = "none";
      loginSection.style.display = "block";
    } catch (error) {
      console.error("Erro ao apagar conta:", error);
      alert("Erro ao apagar conta. Verifique o console.");
    }
  });

// =========================
// 👁️ MOSTRAR / OCULTAR SENHA
// =========================
document.querySelectorAll(".toggle-senha").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (input.type === "password") {
      input.type = "text";
    } else {
      input.type = "password";
    }
  });
});
