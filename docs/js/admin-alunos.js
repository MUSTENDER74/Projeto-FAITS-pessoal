import { db } from "./firebase-config.js";
import {
  ref,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

const alunosContainer = document.getElementById("alunos-lista");
const ordenarSelect = document.getElementById("ordenar-alunos");

let alunos = [];

// --------------------------------------------------------------
// CARREGAR ALUNOS DA COLEÇÃO /alunos
// --------------------------------------------------------------
async function carregarAlunos() {
  try {
    const alunosRef = ref(db, "alunos");
    const snapshot = await get(alunosRef);

    alunos = [];

    if (snapshot.exists()) {
      const dados = snapshot.val();

      Object.entries(dados).forEach(([id, aluno]) => {
        alunos.push({
          id, // ID no banco (normalmente RA)
          nome: aluno.username,
          ra: aluno.ra,
          curso: aluno.curso,
        });
      });
    }

    renderizarAlunos();
  } catch (error) {
    console.error(error);
    alunosContainer.innerHTML = "<p>Erro ao carregar alunos.</p>";
  }
}

// --------------------------------------------------------------
// EXCLUIR ALUNO
// --------------------------------------------------------------
async function excluirAluno(id) {
  if (!confirm("Tem certeza que deseja excluir este aluno?")) return;

  try {
    await update(ref(db), {
      [`alunos/${id}`]: null,
    });

    alert("Aluno removido!");
    carregarAlunos();
  } catch (error) {
    console.error(error);
    alert("Erro ao excluir aluno.");
  }
}

// --------------------------------------------------------------
// RENDERIZAR CARDS
// --------------------------------------------------------------
function renderizarAlunos() {
  alunosContainer.innerHTML = "";

  if (alunos.length === 0) {
    alunosContainer.innerHTML = "<p>Nenhum aluno encontrado.</p>";
    return;
  }

  alunos.forEach((aluno) => {
    const card = document.createElement("div");
    card.classList.add("card-aluno");

    card.innerHTML = `
      <button class="btn-excluir">X</button>

      <h2>${aluno.nome}</h2>
      <p><strong>RA:</strong> ${aluno.ra}</p>
      <p><strong>Curso:</strong> ${aluno.curso}</p>
    `;

    card.querySelector(".btn-excluir").addEventListener("click", () => {
      excluirAluno(aluno.id);
    });

    alunosContainer.appendChild(card);
  });
}

// --------------------------------------------------------------
// ORDENAR
// --------------------------------------------------------------
ordenarSelect.addEventListener("change", () => {
  const valor = ordenarSelect.value;

  if (valor === "nome-asc") alunos.sort((a, b) => a.nome.localeCompare(b.nome));
  if (valor === "nome-desc")
    alunos.sort((a, b) => b.nome.localeCompare(a.nome));

  if (valor === "ra-asc") alunos.sort((a, b) => a.ra.localeCompare(b.ra));
  if (valor === "ra-desc") alunos.sort((a, b) => b.ra.localeCompare(a.ra));

  renderizarAlunos();
});

// Inicializa
carregarAlunos();
