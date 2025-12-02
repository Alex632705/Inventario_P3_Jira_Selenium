document.addEventListener('DOMContentLoaded', function() {
    //  DOOMMMMMMMMMMM
    const productoForm = document.getElementById('producto-form');
    const productosList = document.getElementById('productos-list');
    const cancelBtn = document.getElementById('cancel-btn');
    const formTitle = document.getElementById('form-title');
    const fotoUpload = document.getElementById('foto-upload');
    const fotoPreview = document.getElementById('foto-preview');
    
    let editingId = null;

    
    cargarProductos();

    
    productoForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';

        
        const producto = {
            codigo: document.getElementById('codigo').value,
            nombre: document.getElementById('nombre').value,
            descripcion: document.getElementById('descripcion').value,
            cantidad: parseInt(document.getElementById('cantidad').value),
            precio: parseFloat(document.getElementById('precio').value)
        };

        try {
            if (editingId) {
                await actualizarProducto(editingId, producto);
            } else {
                await crearProducto(producto);
            }
            
            
            productoForm.reset();
            fotoPreview.style.display = 'none';
            editingId = null;
            formTitle.textContent = 'Agregar Nuevo Producto';
            
            
            await cargarProductos();
        } catch (error) {
            console.error('Error al guardar el producto:', error);
            alert('Error al guardar el producto: ' + (error.message || 'Verifica los datos e intenta nuevamente'));
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar';
        }
    });

    
    cancelBtn.addEventListener('click', function() {
        editingId = null;
        formTitle.textContent = 'Agregar Nuevo Producto';
        productoForm.reset();
        fotoPreview.style.display = 'none';
    });

    
    fotoUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (file) {
            
            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen es demasiado grande. El tamaño máximo permitido es 5MB.');
                e.target.value = '';
                return;
            }

            
            if (!file.type.match('image.*')) {
                alert('Por favor selecciona un archivo de imagen (JPEG, PNG, etc.)');
                e.target.value = '';
                return;
            }

            
            const reader = new FileReader();
            reader.onload = function(e) {
                fotoPreview.src = e.target.result;
                fotoPreview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        } else {
            fotoPreview.style.display = 'none';
        }
    });

    
    async function cargarProductos() {
        try {
            const response = await fetch('/api/productos');
            if (!response.ok) throw await response.json();
            
            const data = await response.json();
            productosList.innerHTML = '';
            
            data.forEach(producto => {
                agregarProductoALista(producto);
            });
        } catch (error) {
            console.error('Error al cargar productos:', error);
            alert('Error al cargar los productos');
        }
    }

    
    function agregarProductoALista(producto) {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto-card';
        
        
        const imagenSrc = producto.foto && producto.foto !== 'default.jpg' 
            ? `/uploads/${producto.foto}` 
            : 'default.jpg';

        productoDiv.innerHTML = `
            <img src="${imagenSrc}" alt="${producto.nombre}" class="producto-img" onerror="this.src='default.jpg'">
            <div class="producto-info">
                <h3>${producto.nombre} (Código: ${producto.codigo})</h3>
                <p>${producto.descripcion}</p>
                <p>Cantidad: ${producto.cantidad} | Precio: $${producto.precio.toFixed(2)}</p>
            </div>
            <div class="producto-actions">
                <button class="action-btn edit-btn" data-id="${producto._id}">Editar</button>
                <button class="action-btn delete-btn" data-id="${producto._id}">Eliminar</button>
            </div>
        `;
        
        productosList.appendChild(productoDiv);

        
        productoDiv.querySelector('.edit-btn').addEventListener('click', function() {
            editarProducto(producto._id);
        });

        productoDiv.querySelector('.delete-btn').addEventListener('click', function() {
            eliminarProducto(producto._id);
        });
    }

    
    async function crearProducto(producto) {
        const formData = new FormData();
        
        
        for (const key in producto) {
            formData.append(key, producto[key]);
        }
        
        
        if (fotoUpload.files[0]) {
            formData.append('foto', fotoUpload.files[0]);
        }

        const response = await fetch('/api/productos', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw await response.json();
        return await response.json();
    }

    
    async function editarProducto(id) {
        try {
            const response = await fetch(`/api/productos/${id}`);
            if (!response.ok) throw await response.json();
            
            const data = await response.json();
            editingId = data._id;
            formTitle.textContent = 'Editar Producto';
            
            
            document.getElementById('producto-id').value = data._id;
            document.getElementById('codigo').value = data.codigo;
            document.getElementById('nombre').value = data.nombre;
            document.getElementById('descripcion').value = data.descripcion;
            document.getElementById('cantidad').value = data.cantidad;
            document.getElementById('precio').value = data.precio;

            
            if (data.foto && data.foto !== 'default.jpg') {
                fotoPreview.src = `/uploads/${data.foto}`;
                fotoPreview.style.display = 'block';
            } else {
                fotoPreview.style.display = 'none';
            }
            
            
            document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error al cargar producto para editar:', error);
            alert('No se pudo cargar el producto para editar');
        }
    }

    
    async function actualizarProducto(id, producto) {
        const formData = new FormData();
        
        
        for (const key in producto) {
            formData.append(key, producto[key]);
        }
        
        
        if (fotoUpload.files[0]) {
            formData.append('foto', fotoUpload.files[0]);
        }

        const response = await fetch(`/api/productos/${id}`, {
            method: 'PATCH',
            body: formData
        });

        if (!response.ok) throw await response.json();
        return await response.json();
    }

    
    async function eliminarProducto(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
        
        try {
            const response = await fetch(`/api/productos/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw await response.json();
            
            await cargarProductos();
            alert('Producto eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            alert('Error al eliminar el producto');
        }
    }

    async function guardarProducto(producto, id = null) {
    const formData = new FormData();
    formData.append('codigo', producto.codigo);
    formData.append('nombre', producto.nombre);
    formData.append('descripcion', producto.descripcion);
    formData.append('cantidad', producto.cantidad);
    formData.append('precio', producto.precio);
    
    if (fotoUpload.files[0]) {
        formData.append('foto', fotoUpload.files[0]);
    }

    const url = id ? `/api/productos/${id}` : '/api/productos';
    const method = id ? 'PATCH' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            body: formData
            
        });

        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Respuesta inesperada: ${text.substring(0, 100)}...`);
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en guardarProducto:', error);
        throw error;
    }
}
});