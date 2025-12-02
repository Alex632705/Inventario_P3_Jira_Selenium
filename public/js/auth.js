document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    // Verificar si ya está autenticado
    const usuario = JSON.parse(localStorage.getItem('usuario_inventario'));
    if (usuario && window.location.pathname === '/login') {
        window.location.href = '/inventario';
        return;
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const mensaje = document.getElementById('mensaje');
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            try {
                // Mostrar loading
                submitBtn.disabled = true;
                submitBtn.textContent = 'Verificando...';
                mensaje.textContent = 'Conectando con la base de datos...';
                mensaje.className = 'mensaje';
                
                console.log('📡 Enviando credenciales al servidor...');
                
                // Hacer petición a la base de datos
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Error en el login');
                }
                
                // Login exitoso
                mensaje.textContent = '✅ ' + data.mensaje;
                mensaje.className = 'mensaje success';
                
                // Guardar en localStorage
                localStorage.setItem('usuario_inventario', JSON.stringify(data.usuario));
                
                console.log('👤 Usuario autenticado:', data.usuario.nombre);
                
                // Redirigir al inventario
                setTimeout(() => {
                    window.location.href = '/inventario';
                }, 1000);
                
            } catch (error) {
                console.error('❌ Error de login:', error);
                mensaje.textContent = '❌ ' + error.message;
                mensaje.className = 'mensaje error';
                
                // Restaurar botón
                submitBtn.disabled = false;
                submitBtn.textContent = 'Ingresar al Sistema';
            }
        });
    }
    
    // Auto-rellenar credenciales de prueba (opcional, para desarrollo)
    document.getElementById('email').value = 'admin@empresa.com';
    document.getElementById('password').value = 'admin123';
});