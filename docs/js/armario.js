import { db } from "./firebase-config.js";
import {
  ref,
  set,
  push,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// VARIÁVEL GLOBAL PARA ARMAZENAR OS PROJETOS CARREGADOS
let projetosArray = [];

document.addEventListener("DOMContentLoaded", () => {
  console.log("🔰 armario.js carregado"); // ELEMENTOS DA INTERFACE

  const botoesAbrirForm = document.querySelectorAll(".js-abrir-form");
  const cadastrarSection = document.getElementById("add-project-section");
  const projectForm = document.getElementById("project-form");
  const btnCancelar = document.getElementById("btn-cancelar");
  const containerProjetos = document.getElementById("projects-grid-container");
  const btnSubmit = projectForm.querySelector('[type="submit"]'); // NOVO: Elemento de Ordenação

  const ordenacaoSelect = document.getElementById("ordenacao-select"); // Área de detalhes

  const detailsSection = document.getElementById("project-details");
  const detailsContent = document.getElementById("project-details-content");
  const btnCloseDetails = document.getElementById("close-project-details"); // =============================== // FUNÇÕES DO FORMULÁRIO (MANTIDAS) // ===============================

  function abrirFormulario() {
    cadastrarSection.classList.remove("hidden");
    cadastrarSection.scrollIntoView({ behavior: "smooth" });
  }

  function fecharFormulario() {
    cadastrarSection.classList.add("hidden");
    projectForm.reset();
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Salvar";
  }

  function capturarIntegrantes() {
    const integrantes = [];
    for (let i = 1; i <= 6; i++) {
      const nome = document.getElementById(`integrante${i}-nome`)?.value.trim();
      const ra = document.getElementById(`integrante${i}-ra`)?.value.trim();
      if (nome && ra) integrantes.push({ nome, ra });
    }
    return integrantes;
  }

  function validarRAs() {
    const ras = [];

    for (let i = 1; i <= 6; i++) {
      const ra = document.getElementById(`integrante${i}-ra`)?.value.trim();
      if (ra) ras.push(ra);
    }

    const ra1 = document.getElementById("integrante1-ra")?.value.trim();
    const ra2 = document.getElementById("integrante2-ra")?.value.trim();

    if (!ra1 || !ra2) {
      alert("Os dois primeiros integrantes precisam ter RA preenchido.");
      return false;
    }

    if (new Set(ras).size !== ras.length) {
      alert("Existem RAs repetidos! Cada RA deve ser único.");
      return false;
    }

    return true;
  } // =============================== // SALVAR NO FIREBASE (MANTIDO) // ===============================

  async function handleSalvarProjeto(event) {
    event.preventDefault();

    const titulo = document.getElementById("form-titulo").value.trim();
    const descricao = document.getElementById("form-descricao").value.trim();
    const curso = document.getElementById("form-curso").value.trim();
    const linkExterno = document.getElementById("form-link").value.trim();

    if (!validarRAs()) return;

    if (!titulo || !descricao || !curso) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Salvando...";

    const integrantes = capturarIntegrantes();

    try {
      const projetosRef = ref(db, "projetos");
      const novoProjetoRef = push(projetosRef);
      const idProjeto = novoProjetoRef.key;

      await set(novoProjetoRef, {
        id: idProjeto,
        titulo,
        descricao,
        curso,
        linkExterno,
        integrantes,
        dataCriacao: new Date().toISOString(),
      });

      alert(`✔ Projeto "${titulo}" cadastrado com sucesso!`);
      fecharFormulario(); // Recarrega, o que recarrega o array e renderiza
      carregarTodosProjetos();
    } catch (erro) {
      console.error("❌ Erro ao salvar projeto:", erro);
      alert("Erro ao salvar projeto.");
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Salvar";
    }
  } // =============================== // NOVO: RENDERIZAR PROJETOS // ===============================

  function renderizarProjetos(projetosParaExibir) {
    containerProjetos.innerHTML = "";
    if (projetosParaExibir.length > 0) {
      projetosParaExibir.forEach((projeto) => {
        const card = criarCardProjeto(projeto);
        containerProjetos.appendChild(card);
      });
    } else {
      containerProjetos.innerHTML =
        "<p>📂 Nenhum projeto encontrado com os critérios de filtro/ordenação.</p>";
    }
  } // =============================== // CARREGAR TODOS OS PROJETOS // ===============================

  async function carregarTodosProjetos() {
    try {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, "projetos"));

      if (snapshot.exists()) {
        // Popula o array global, usando .reverse() para mostrar os mais novos primeiro
        projetosArray = Object.values(snapshot.val()).reverse(); // Garante que a primeira exibição use a ordem padrão (reversa, mais novo)
        renderizarProjetos(projetosArray);
      } else {
        projetosArray = [];
        containerProjetos.innerHTML =
          "<p>📂 Nenhum projeto cadastrado ainda.</p>";
      }
    } catch (erro) {
      console.error("❌ Erro ao carregar projetos:", erro);
      containerProjetos.innerHTML = "<p>Erro ao carregar projetos.</p>";
    }
  } // =============================== // NOVO: LÓGICA DE ORDENAÇÃO // ===============================

  function ordenarProjetos(tipoOrdenacao) {
    if (projetosArray.length === 0) return;

    const projetosOrdenados = [...projetosArray]; // Cria uma cópia para ordenar

    projetosOrdenados.sort((a, b) => {
      switch (tipoOrdenacao) {
        case "titulo-asc": // Ordem Alfabética A-Z (título)
          return a.titulo.localeCompare(b.titulo);
        case "titulo-desc": // Ordem Alfabética Z-A (título)
          return b.titulo.localeCompare(a.titulo);
        case "integrantes-desc": // Por Quantidade de Integrantes (Maior para Menor) // Se integrantes for nulo, usa 0
          const qtdA_desc = a.integrantes ? a.integrantes.length : 0;
          const qtdB_desc = b.integrantes ? b.integrantes.length : 0;
          return qtdB_desc - qtdA_desc;
        case "integrantes-asc": // Por Quantidade de Integrantes (Menor para Maior)
          const qtdA_asc = a.integrantes ? a.integrantes.length : 0;
          const qtdB_asc = b.integrantes ? b.integrantes.length : 0;
          return qtdA_asc - qtdB_asc;
        default: // Se a opção padrão for selecionada, usa a ordem original (mais novo)
          return 0;
      }
    }); // Após ordenar, renderiza o resultado

    renderizarProjetos(projetosOrdenados);
  } // =============================== // CRIAR CARD DA LISTA (MANTIDO) // ===============================

  function criarCardProjeto(projeto) {
    const card = document.createElement("div");
    card.classList.add("projeto-card");

    card.innerHTML = `
    <h3>${escapeHtml(projeto.titulo || "")}</h3>
  `; // Ao clicar, abre o modal completo

    card.addEventListener("click", () => exibirProjetoCompleto(projeto));

    return card;
  } // =============================== // FUNÇÕES DE DETALHES, MODAL E SANITIZAÇÃO (MANTIDAS) // =============================== // ... (mantidas as funções abrirDetalhes, fecharDetalhes, escapeHtml, exibirProjetoCompleto) // ... (O restante das funções de detalhes e modal continua aqui, como no seu código original) ... // Função de Sanitização (Escape HTML) - Mantenha no final ou onde estava

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ⬇️ FUNÇÃO ATUALIZADA PARA O NOVO ESTILO (APENAS VISUALIZAÇÃO) ⬇️
  function exibirProjetoCompleto(projeto) {
    const modal = document.getElementById("modal-projeto");
    const caixa = document.getElementById("modal-projeto-detalhes"); // 1. Gera o HTML dos Integrantes

    const integrantesHtml =
      projeto.integrantes && projeto.integrantes.length > 0
        ? projeto.integrantes
            .map((i, index) => {
              return `
              <div class="form-group integrante-detalhe">
                  <label>Integrante ${index + 1}</label>
                  <div class="input-fake">${escapeHtml(i.nome)}</div>
              </div>
              <div class="form-group ra-detalhe">
                  <label>RA</label>
                  <div class="input-fake">${escapeHtml(i.ra)}</div>
              </div>
                            ${
                index < projeto.integrantes.length - 1
                  ? '<div class="separador-visual"></div>'
                  : ""
              }
          `;
            })
            .join("")
        : '<p class="aviso-integrantes">Nenhum integrante cadastrado.</p>'; // 2. Monta o conteúdo final

    caixa.innerHTML = `
        <h2 class="detalhes-titulo">Detalhes do Projeto</h2>

                <div class="form-group">
            <label>Título</label>
            <div class="input-fake">${escapeHtml(projeto.titulo)}</div>
        </div>

                <div class="form-group">
            <label>Descrição</label>
            <div class="input-fake textarea-fake">${escapeHtml(
      projeto.descricao
    )}</div>
        </div>

                <div class="form-group">
            <label>Curso</label>
            <div class="input-fake">${escapeHtml(projeto.curso)}</div>
        </div>
        
        <hr style="margin: 20px 0;">

                <h3 class="integrantes-subtitulo">Integrantes (${
      projeto.integrantes ? projeto.integrantes.length : 0
    })</h3>
        ${integrantesHtml}
        
                <div class="botoes-integrante-simples">
            <span>Link Externo:</span>
        </div>

                <div class="form-group link-detalhe">
            ${
      projeto.linkExterno
        ? `<div class="input-fake link-ativo"><a href="${
            projeto.linkExterno
          }" target="_blank">${escapeHtml(projeto.linkExterno)}</a></div>`
        : '<div class="input-fake">Nenhum link cadastrado</div>'
    }
        </div>
        
                <div class="form-group documento-detalhe">
            <label>Documento / Artigo</label>
            <div class="input-fake input-file-fake-visual">
                <span>Documento vinculado (Visualizar)</span>
                <a href="#" target="_blank" class="btn-visual-arquivo">Visualizar</a>
            </div>
        </div>
        
            `;

    modal.classList.remove("hidden");
  }
  // ⬆️ FIM DA FUNÇÃO ATUALIZADA ⬆️

  document.getElementById("modal-fechar").addEventListener("click", () => {
    document.getElementById("modal-projeto").classList.add("hidden");
  }); // Fechar ao clicar fora da caixa

  document.getElementById("modal-projeto").addEventListener("click", (e) => {
    if (e.target.id === "modal-projeto") {
      document.getElementById("modal-projeto").classList.add("hidden");
    }
  }); // =============================== // EVENTOS // ===============================

  botoesAbrirForm.forEach((btn) =>
    btn.addEventListener("click", abrirFormulario)
  );

  btnCancelar?.addEventListener("click", fecharFormulario);

  projectForm?.addEventListener("submit", handleSalvarProjeto);

  btnCloseDetails?.addEventListener("click", fecharDetalhes); // NOVO EVENTO: Monitora a mudança na lista de seleção

  ordenacaoSelect?.addEventListener("change", (event) => {
    ordenarProjetos(event.target.value);
  }); // CARREGAR NA INICIALIZAÇÃO

  carregarTodosProjetos();
});
