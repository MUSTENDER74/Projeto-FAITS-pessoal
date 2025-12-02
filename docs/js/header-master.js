document.addEventListener('DOMContentLoaded', () => {

    // 1. SELETORES DO HTML
    // Pegamos os dois cabeçalhos que você criou no HTML
    const headerPadrao = document.getElementById('header-padrao');
    const headerMaster = document.getElementById('header-master');
    const adminRaDisplay = document.getElementById('admin-ra-display');
    const btnSairMaster = document.getElementById('btn-sair-master-header');

    // 2. VERIFICA O LOCAL STORAGE (Baseado no seu código de login)
    function verificarLoginAdmin() {
        // Tenta pegar o item que você salvou no login
        const sessaoJson = localStorage.getItem("usuarioLogado");

        if (sessaoJson) {
            // Converte de texto JSON de volta para Objeto
            const usuario = JSON.parse(sessaoJson);

            // Verifica se o tipo salvo é realmente "admin"
            if (usuario.tipo === 'admin') {
                ativarModoMaster(usuario);
                return;
            }
        }

        // Se não encontrou nada no localStorage, mostra o site normal
        ativarModoPadrao();
    }

    // 3. FUNÇÃO QUE ATIVA O HEADER DE ADMIN
    function ativarModoMaster(usuario) {
        console.log("Modo Master detectado no LocalStorage");

        // Esconde o header normal e mostra o header master
        if (headerPadrao) headerPadrao.classList.add('hidden');
        if (headerMaster) headerMaster.classList.remove('hidden');

        // Preenche o texto com o Nome ou RA salvo no seu JSON
        if (adminRaDisplay) {
            adminRaDisplay.textContent = `Olá, ${usuario.nome || usuario.ra}`;
        }
    }

    // 4. FUNÇÃO QUE ATIVA O HEADER PADRÃO
    function ativarModoPadrao() {
        // Garante que o header normal apareça e o master suma
        if (headerPadrao) headerPadrao.classList.remove('hidden');
        if (headerMaster) headerMaster.classList.add('hidden');
    }

    // 5. LÓGICA DE SAIR (LOGOUT)
    // Precisa limpar o localStorage que você criou
    if (btnSairMaster) {
        btnSairMaster.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Deseja sair do modo administrativo?")) {
                // Remove o item que o seu login criou
                localStorage.removeItem("usuarioLogado");
                localStorage.removeItem("raLogado"); // Remove o RA também, por garantia
                
                // Redireciona para a home
                window.location.href = 'index.html';
            }
        });
    }

    // Executa a verificação assim que a página carrega
    verificarLoginAdmin();
});