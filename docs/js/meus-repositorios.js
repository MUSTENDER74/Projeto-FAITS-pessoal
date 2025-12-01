// =========================
// 🔥 IMPORTAÇÕES DO FIREBASE
// =========================
import { db } from "./firebase-config.js";

import {
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// =========================
// 📌 RECUPERAR RA DO USUÁRIO
// =========================
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuarioLogado) {
  alert("Você precisa fazer login primeiro!");
  window.location.href = "login.html";
}

const raUsuario = usuarioLogado.ra;

// =========================
// 🔥 BUSCAR REPOSITÓRIOS
// =========================
async function carregarRepositorios() {
  const container = document.getElementById("listaRepositorios");
  container.innerHTML = "<p>Carregando repositórios...</p>";

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, "projetos"));

    if (!snapshot.exists()) {
      container.innerHTML = `<p>Você ainda não possui nenhum repositório.</p>`;
      return;
    }

    const repos = snapshot.val();
    const reposArray = Object.values(repos);

    // 🔎 Filtra repositórios onde o usuário está nos integrantes
    const reposFiltrados = reposArray.filter(
      (repo) =>
        repo.integrantes &&
        Object.values(repo.integrantes).some(
          (p) => String(p.ra) === String(raUsuario)
        )
    );

    if (reposFiltrados.length === 0) {
      container.innerHTML = `<p>Você ainda não possui nenhum repositório.</p>`;
      return;
    }

    container.innerHTML = "";

    // Criar cards dos projetos
    reposFiltrados.forEach((repo) => {
      const card = document.createElement("div");
      card.className = "cardRepositorio";

      card.innerHTML = `
        <h3>${repo.titulo}</h3>
        <p><strong>Curso:</strong> ${repo.curso}</p>
        <p><strong>Descrição:</strong> ${repo.descricao}</p>
      `;

      // 👉 Clicar para abrir detalhes
      card.addEventListener("click", () => {
        window.location.href = `detalhes-projeto.html?id=${repo.id}`;
      });

      container.appendChild(card);
    });
  } catch (erro) {
    console.error("Erro ao carregar repositórios:", erro);
    container.innerHTML = `<p>Erro ao carregar repositórios.</p>`;
  }
}

// =========================
// ▶️ INICIAR AO CARREGAR PÁGINA
// =========================
document.addEventListener("DOMContentLoaded", carregarRepositorios);
