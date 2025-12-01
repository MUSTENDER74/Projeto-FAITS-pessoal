// =========================
// 🔥 IMPORTAÇÕES
// =========================
import { db } from "./firebase-config.js";
import {
  ref,
  get,
  update,
  remove,
  child,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// =========================
// 📌 PEGAR ID DA URL
// =========================
const params = new URLSearchParams(window.location.search);
const projetoId = params.get("id");

if (!projetoId) {
  alert("ID do projeto não encontrado!");
  window.location.href = "config.html";
}

// =========================
// 📌 ELEMENTOS DO HTML
// =========================
const tituloInput = document.getElementById("edit-titulo");
const descInput = document.getElementById("edit-descricao");
const cursoInput = document.getElementById("edit-curso");
const linkInput = document.getElementById("edit-link");
const areaIntegrantes = document.getElementById("area-integrantes");

const btnSalvar = document.getElementById("btn-salvar");
const btnExcluir = document.getElementById("btn-excluir");
const btnAddIntegrante = document.getElementById("btnAddIntegrante");

// =========================
// 📌 CARREGAR DADOS DO FIREBASE
// =========================
async function carregarProjeto() {
  try {
    const snap = await get(child(ref(db), `projetos/${projetoId}`));

    if (!snap.exists()) {
      alert("Projeto não encontrado!");
      window.location.href = "config.html";
      return;
    }

    const dados = snap.val();

    // Preencher os inputs
    tituloInput.value = dados.titulo || "";
    descInput.value = dados.descricao || "";
    cursoInput.value = dados.curso || "";
    linkInput.value = dados.link || "";

    // =============== INTEGRANTES ===============
    areaIntegrantes.innerHTML = "";
    const integrantes = dados.integrantes || {};

    Object.keys(integrantes).forEach((key) => {
      adicionarCampoIntegrante(integrantes[key].nome, integrantes[key].ra);
    });
  } catch (e) {
    console.error("Erro ao carregar detalhes:", e);
  }
}

carregarProjeto();

// =========================
// 📌 ADICIONAR CAMPO DE INTEGRANTE
// =========================
function adicionarCampoIntegrante(nome = "", ra = "") {
  const qtd = areaIntegrantes.children.length;

  if (qtd >= 6) {
    alert("Máximo de 6 integrantes!");
    return;
  }

  const div = document.createElement("div");
  div.className = "integrante-item";
  div.style.marginBottom = "10px";

  div.innerHTML = `
    <input type="text" placeholder="Nome do integrante" class="detalhes-input integrante-nome" value="${nome}">
    <input type="text" placeholder="RA" class="detalhes-input integrante-ra" value="${ra}">
    <button type="button" class="btn-excluir-integrante" style="background:red;color:white;border:none;padding:6px 10px;border-radius:6px;cursor:pointer">X</button>
  `;

  // botão remover
  div.querySelector(".btn-excluir-integrante").addEventListener("click", () => {
    div.remove();
  });

  areaIntegrantes.appendChild(div);
}

// botão adicionar
btnAddIntegrante.addEventListener("click", () => {
  adicionarCampoIntegrante();
});

// =========================
// 📌 SALVAR ALTERAÇÕES
// =========================
btnSalvar.addEventListener("click", async (e) => {
  e.preventDefault();

  // montar integrantes
  const nomes = [...document.querySelectorAll(".integrante-nome")];
  const ras = [...document.querySelectorAll(".integrante-ra")];

  if (nomes.length < 2) {
    alert("O projeto deve ter no mínimo 2 integrantes.");
    return;
  }

  const integrantes = {};
  nomes.forEach((el, i) => {
    integrantes[i] = { nome: el.value, ra: ras[i].value };
  });

  try {
    await update(ref(db, `projetos/${projetoId}`), {
      titulo: tituloInput.value,
      descricao: descInput.value,
      link: linkInput.value,
      integrantes,
    });

    alert("Projeto atualizado!");
  } catch (erro) {
    console.error(erro);
    alert("Erro ao salvar.");
  }
});

// =========================
// 📌 EXCLUIR PROJETO
// =========================
btnExcluir.addEventListener("click", async () => {
  if (!confirm("Tem certeza que deseja excluir este projeto?")) return;

  try {
    await remove(ref(db, `projetos/${projetoId}`));
    alert("Projeto excluído!");
    window.location.href = "config.html";
  } catch (erro) {
    console.error(erro);
    alert("Erro ao excluir.");
  }
});
