// js/armario.js

// Espera o HTML carregar completamente antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {

    console.log("armario.js carregado. Iniciando lógica do formulário...");

    // ======================================================
    // SELETORES DE ELEMENTOS DO DOM (O Mapa da Página)
    // ======================================================
    
    // 1. Os botões que ABREM o formulário (ambos têm a mesma classe)
    const botoesAbrirForm = document.querySelectorAll('.js-abrir-form');

    // 2. A seção do formulário que será mostrada/escondida
    const addProjectSection = document.getElementById('add-project-section');

    // 3. O formulário em si (para 'submit' e 'reset')
    const projectForm = document.getElementById('project-form');

    // 4. O botão de "Cancelar" dentro do formulário
    const btnCancelar = document.getElementById('btn-cancelar');

    // ======================================================
    // FUNÇÕES DE CONTROLE DO FORMULÁRIO
    // ======================================================

    /**
     * Esta é a FUNÇÃO PARA O BOTÃO: ela torna o formulário visível.
     */
    function abrirFormulario() {
        if (addProjectSection) {
            addProjectSection.classList.remove('hidden');
            console.log("Formulário aberto.");
        } else {
            console.error("Erro: A seção do formulário (#add-project-section) não foi encontrada.");
        }
    }

    /**
     * Esta é a FUNÇÃO para fechar o formulário.
     */
    function fecharFormulario() {
        if (addProjectSection) {
            addProjectSection.classList.add('hidden');
            if (projectForm) {
                projectForm.reset(); // Limpa os campos do formulário
            }
            console.log("Formulário fechado.");
        }
    }

    /**
     * Esta é a FUNÇÃO para "RECEBER" o formulário.
     * Ela é acionada ao clicar no botão "Salvar Projeto".
     */
    function handleSalvarProjeto(event) {
        // 1. Impede que a página recarregue (o comportamento padrão do formulário)
        event.preventDefault(); 

        // 2. "Recebe" os dados (apenas para teste)
        // Usamos os IDs únicos que definimos no HTML corrigido
        const titulo = document.getElementById('form-titulo').value;
        const repositorio = document.getElementById('form-repositorio').value;

        // 3. Mostra um feedback de que funcionou
        console.log("Formulário enviado! (Modo de Teste)");
        console.log("Título:", titulo);
        console.log("Repositório:", repositorio);
        alert(`Projeto "${titulo}" salvo no modo de teste!`);

        // 4. Fecha o formulário
        fecharFormulario();
    }

    // ======================================================
    // INICIALIZAÇÃO DOS EVENTOS (Ligando os "fios")
    // ======================================================

    // Verifica se os elementos necessários existem antes de ligar os eventos
    
    if (botoesAbrirForm.length > 0 && addProjectSection) {
        // Adiciona o evento de 'click' a CADA botão que abre o formulário
        botoesAbrirForm.forEach(botao => {
            botao.addEventListener('click', abrirFormulario);
        });
        console.log(`Pronto! ${botoesAbrirForm.length} botão(ões) de abrir formulário foram ligados.`);
    } else {
        console.warn("Aviso: Botões de abrir (.js-abrir-form) ou a seção do formulário (#add-project-section) não foram encontrados.");
    }

    // Liga o evento de 'click' ao botão "Cancelar"
    if (btnCancelar) {
        btnCancelar.addEventListener('click', fecharFormulario);
    }

    // Liga o evento de 'submit' ao formulário
    if (projectForm) {
        projectForm.addEventListener('submit', handleSalvarProjeto);
    }
});