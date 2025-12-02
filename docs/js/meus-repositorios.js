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
// 📌 RECUPERAR USUÁRIO LOGADO
// =========================
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuarioLogado) {
  alert("Você precisa fazer login primeiro!");
  window.location.href = "index.html";
}

const raUsuario = usuarioLogado.ra;
const tipoUsuario = usuarioLogado.tipo; // admin | professor | aluno

// Elemento do filtro (se existir no HTML)
const selectOrdenacao = document.getElementById("ordenacao-select");

// Lista dos repositórios filtrados
let reposFiltradosGlobal = [];

// =========================
// 🔥 FUNÇÃO PARA ORDENAR
// =========================
function aplicarOrdenacao(tipo) {
  if (!reposFiltradosGlobal || reposFiltradosGlobal.length === 0) return;

  let lista = [...reposFiltradosGlobal];

  switch (tipo) {
    case "titulo-asc":
      lista.sort((a, b) => (a.titulo || "").localeCompare(b.titulo || ""));
      break;

    case "titulo-desc":
      lista.sort((a, b) => (b.titulo || "").localeCompare(a.titulo || ""));
      break;

    case "integrantes-desc":
      lista.sort(
        (a, b) => (b.integrantes?.length || 0) - (a.integrantes?.length || 0)
      );
      break;

    case "integrantes-asc":
      lista.sort(
        (a, b) => (a.integrantes?.length || 0) - (b.integrantes?.length || 0)
      );
      break;
  }

  criarCards(lista);
}

// Evento do SELECT (somente admin e professor)
if (
  selectOrdenacao &&
  (tipoUsuario === "admin" || tipoUsuario === "professor")
) {
  selectOrdenacao.addEventListener("change", (e) => {
    aplicarOrdenacao(e.target.value);
  });
} else if (selectOrdenacao) {
  // Se for aluno: esconder o filtro
  selectOrdenacao.parentElement.style.display = "none";
}

// =========================
// 🔥 CRIAR CARDS
// =========================
function criarCards(lista) {
  const container = document.getElementById("listaRepositorios");
  container.innerHTML = "";

  lista.forEach((repo) => {
    const card = document.createElement("div");
    card.className = "cardRepositorio";

    card.innerHTML = `
      <h3>${repo.titulo ?? "Sem título"}</h3>
      <p><strong>Curso:</strong> ${repo.curso ?? "Não informado"}</p>
      <p><strong>Descrição:</strong> ${repo.descricao ?? "Não informada"}</p>
    `;

    // 👉 Abrir página de edição/detalhes
    card.addEventListener("click", () => {
      window.location.href = `detalhes-projeto.html?id=${repo.id}`;
    });

    container.appendChild(card);
  });
}

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
      container.innerHTML = `<p>Nenhum repositório encontrado.</p>`;
      return;
    }

    const repos = snapshot.val();

    const reposArray = Object.entries(repos).map(([id, item]) => ({
      id,
      ...item,
    }));

    let reposFiltrados;

    // ADMIN E PROFESSOR - ver todos
    if (tipoUsuario === "admin" || tipoUsuario === "professor") {
      reposFiltrados = reposArray;
    }
    // ALUNO – ver só os próprios
    else {
      reposFiltrados = reposArray.filter(
        (repo) =>
          repo.integrantes &&
          Object.values(repo.integrantes).some(
            (p) => String(p.ra) === String(raUsuario)
          )
      );
    }

    if (reposFiltrados.length === 0) {
      container.innerHTML = `<p>Nenhum repositório disponível.</p>`;
      return;
    }

    // Armazena globalmente para aplicar a ordenação depois
    reposFiltradosGlobal = reposFiltrados;

    criarCards(reposFiltrados);
  } catch (erro) {
    console.error("Erro ao carregar repositórios:", erro);
    container.innerHTML = `<p>Erro ao carregar repositórios.</p>`;
  }
}

// =========================
// ▶️ INICIAR
// =========================
document.addEventListener("DOMContentLoaded", carregarRepositorios);
