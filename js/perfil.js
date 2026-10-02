document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            if (email && password) {
                if (rememberMe) {
                    localStorage.setItem('userEmail', email);
                }

                if (typeof mostrarToast === 'function') {
                    mostrarToast('¡Inicio de sesión exitoso!');
                } else {
                    alert('¡Inicio de sesión exitoso!');
                }

                loginForm.reset();
            }
        });
    }
});