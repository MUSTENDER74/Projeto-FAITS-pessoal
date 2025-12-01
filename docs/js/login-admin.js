// 1. Importa a autenticação já configurada
import { auth } from './firebase-init.js'; 
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const ra = document.getElementById('ra').value.trim();
            const senha = document.getElementById('senha').value.trim();

            // 2. O TRUQUE: Transforma o RA em um e-mail interno
            // Ex: se o RA é "1234", vira "1234@admin.faits"
            const emailFormatado = `${ra}@admin.faits`;

            try {
                // 3. Tenta fazer o login seguro no Firebase
                await signInWithEmailAndPassword(auth, emailFormatado, senha);
                
                alert("Login Master realizado com sucesso!");
                
                // 4. Redireciona para o painel
                window.location.href = "painel-master.html";

            } catch (error) {
                console.error("Erro no login master:", error.code);
                
                // Tratamento de erros para dar feedback ao usuário
                if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
                    alert('RA ou Senha incorretos.');
                } else if (error.code === 'auth/invalid-email') {
                    alert('Formato de RA inválido.');
                } else {
                    alert('Erro ao tentar logar: ' + error.message);
                }
            }
        });
    }
});