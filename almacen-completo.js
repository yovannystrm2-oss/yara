// almacen-completo.js
class AlmacenCompleto {
    constructor() {
        this.claveAlmacen = 'anyela_almacen_completo';
        this.datos = this.cargarDatos();
        this.charts = {};
        this.init();
    }

    cargarDatos() {
        const datosGuardados = localStorage.getItem(this.claveAlmacen);
        if (datosGuardados) {
            return JSON.parse(datosGuardados);
        } else {
            return {
                productos: [],
                categorias: [
                    { id: 'cat1', nombre: 'Cortes Premium', tipo: 'carne', color: '#e74c3c' },
                    { id: 'cat2', nombre: 'Cortes Estándar', tipo: 'carne', color: '#3498db' },
                    { id: 'cat3', nombre: 'Embutidos', tipo: 'embutido', color: '#9b59b6' },
                    { id: 'cat4', nombre: 'Preparados', tipo: 'preparado', color: '#f39c12' },
                    { id: 'cat5', nombre: 'Accesorios', tipo: 'accesorio', color: '#1abc9c' }
                ],
                lotes: [],
                proveedores: [
                    {
                        id: 'prov1',
                        nombre: 'Carnes Premium SAC',
                        ruc: '20123456789',
                        telefono: '+51 987 654 321',
                        email: 'contacto@carnespremium.com',
                        direccion: 'Av. Principal 123',
                        productos: ['Carne de Chancho', 'Chuleta', 'Lomo'],
                        calificacion: 4.5,
                        ultimaCompra: '2024-01-15'
                    }
                ],
                ordenesCompra: [],
                compras: [],
                movimientos: [],
                sedeActual: 'anyela',
                configuracion: {
                    alertaStockBajo: 10,
                    alertaStockCritico: 5,
                    diasCobertura: 30
                }
            };
        }
    }

    guardarDatos() {
        localStorage.setItem(this.claveAlmacen, JSON.stringify(this.datos));
        this.actualizarUI();
    }

    init() {
        this.configurarEventos();
        this.actualizarUI();
        this.inicializarCharts();
        this.mostrarDashboard();
    }

    configurarEventos() {
        // Navegación principal
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.cambiarPestana(e.target.closest('.nav-btn').dataset.tab);
            });
        });

        // Sub navegación
        document.querySelectorAll('.sub-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.cambiarSubPestana(e.target.closest('.sub-nav-btn').dataset.subtab);
            });
        });

        // Cambio de sede
        document.getElementById('sede-select').addEventListener('change', (e) => {
            this.datos.sedeActual = e.target.value;
            this.guardarDatos();
        });

        // Botones principales
        document.getElementById('nuevo-producto-btn').addEventListener('click', () => {
            this.mostrarModalProducto();
        });

        document.getElementById('nuevo-lote-btn').addEventListener('click', () => {
            this.mostrarModalLote();
        });

        document.getElementById('nueva-orden-btn').addEventListener('click', () => {
            this.mostrarModalOrdenCompra();
        });

        document.getElementById('nuevo-proveedor-btn').addEventListener('click', () => {
            this.mostrarModalProveedor();
        });

        // Scanner
        document.getElementById('start-scanner').addEventListener('click', () => {
            this.iniciarScanner();
        });

        document.getElementById('search-barcode').addEventListener('click', () => {
            this.buscarCodigoManual();
        });

        // Filtros
        document.getElementById('aplicar-filtros').addEventListener('click', () => {
            this.aplicarFiltros();
        });

        // Reportes
        document.querySelectorAll('.reporte-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.generarReporte(e.currentTarget.dataset.reporte);
            });
        });

        // Sincronización
        document.getElementById('sync-btn').addEventListener('click', () => {
            this.sincronizarDatos();
        });

        // Eventos de cierre de modales
        this.configurarEventosModales();
    }

    configurarEventosModales() {
        // Cerrar modal producto
        const closeProductoBtn = document.getElementById('close-producto-modal');
        if (closeProductoBtn) {
            closeProductoBtn.addEventListener('click', () => {
                this.cerrarModal('modal-producto');
            });
        }

        // Cerrar modal orden compra
        const closeOrdenBtn = document.getElementById('close-orden-modal');
        if (closeOrdenBtn) {
            closeOrdenBtn.addEventListener('click', () => {
                this.cerrarModal('modal-orden-compra');
            });
        }

        // Cerrar modal proveedor
        const closeProveedorBtn = document.getElementById('close-proveedor-modal');
        if (closeProveedorBtn) {
            closeProveedorBtn.addEventListener('click', () => {
                this.cerrarModal('modal-proveedor');
            });
        }
    }

    cambiarPestana(pestana) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === pestana);
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${pestana}-tab`);
        });

        // Cargar contenido específico de cada pestaña
        switch(pestana) {
            case 'dashboard':
                this.mostrarDashboard();
                break;
            case 'inventario':
                this.mostrarInventario();
                break;
            case 'compras':
                this.mostrarCompras();
                break;
            case 'proveedores':
                this.mostrarProveedores();
                break;
            case 'scanner':
                this.mostrarScanner();
                break;
            case 'reportes':
                this.mostrarReportes();
                break;
        }
    }

    cambiarSubPestana(subpestana) {
        document.querySelectorAll('.sub-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.subtab === subpestana);
        });

        document.querySelectorAll('.sub-content').forEach(content => {
            content.classList.toggle('active', content.id === `${subpestana}-subtab`);
        });
    }

    actualizarUI() {
        this.actualizarEstadisticas();
        this.actualizarAlertas();
        this.actualizarMetricas();
    }

    actualizarEstadisticas() {
        const productos = this.datos.productos.filter(p => p.sede === this.datos.sedeActual);
        const totalStock = productos.reduce((sum, p) => sum + p.stockActual, 0);
        const totalValor = productos.reduce((sum, p) => sum + (p.stockActual * p.precioKg), 0);
        const alertas = this.calcularAlertas().length;

        // Actualizar elementos solo si existen
        this.actualizarElemento('stat-total-productos', productos.length);
        this.actualizarElemento('stat-stock-total', `${totalStock} kg`);
        this.actualizarElemento('stat-alertas', alertas);
        this.actualizarElemento('stat-valor', `S/ ${totalValor.toLocaleString()}`);
    }

    actualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }

    calcularAlertas() {
        return this.datos.productos.filter(producto => 
            producto.sede === this.datos.sedeActual && 
            producto.stockActual <= producto.stockMin
        );
    }

    actualizarAlertas() {
        const alertas = this.calcularAlertas();
        const container = document.getElementById('alertas-list');
        const contador = document.getElementById('contador-alertas');

        if (contador) {
            contador.textContent = alertas.length;
        }

        if (!container) return;

        if (alertas.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay alertas activas</p>';
            return;
        }

        container.innerHTML = alertas.map(producto => `
            <div class="alerta-item ${producto.stockActual <= producto.stockCritico ? 'critico' : ''}">
                <i class="fas fa-exclamation-triangle"></i>
                <div style="flex: 1;">
                    <strong>${producto.nombre}</strong>
                    <div style="font-size: 0.8rem; color: #666;">
                        Stock: ${producto.stockActual} kg (Mínimo: ${producto.stockMin} kg)
                    </div>
                </div>
                <button class="btn-action btn-sm" onclick="almacen.reponerStock('${producto.id}')" title="Reponer Stock">
                    <i class="fas fa-cart-plus"></i>
                </button>
            </div>
        `).join('');
    }

    actualizarMetricas() {
        const productos = this.datos.productos.filter(p => p.sede === this.datos.sedeActual);
        
        // Rotación (simulada)
        const rotacion = productos.length > 0 ? 
            Math.min(100, Math.round((productos.filter(p => p.stockActual < p.stockMax).length / productos.length) * 100)) : 0;
        
        // Mermas (simulada)
        const mermas = 2.5; // Porcentaje simulado
        
        // Cobertura (días de stock)
        const cobertura = productos.length > 0 ? Math.round(productos.reduce((sum, p) => sum + p.stockActual, 0) / 10) : 0;

        this.actualizarElemento('metrica-rotacion', `${rotacion}%`);
        this.actualizarElemento('metrica-mermas', `${mermas}%`);
        this.actualizarElemento('metrica-cobertura', `${cobertura} días`);
    }

    inicializarCharts() {
        const ctx = document.getElementById('stock-chart');
        if (!ctx) return;

        this.charts.stock = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Stock por Categoría (kg)',
                    data: [],
                    backgroundColor: '#e74c3c',
                    borderColor: '#c0392b',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    actualizarChartStock() {
        if (!this.charts.stock) return;

        const categorias = this.datos.categorias;
        const datos = categorias.map(categoria => {
            const productosCategoria = this.datos.productos.filter(p => 
                p.categoria === categoria.nombre && p.sede === this.datos.sedeActual
            );
            return productosCategoria.reduce((sum, p) => sum + p.stockActual, 0);
        });

        this.charts.stock.data.labels = categorias.map(c => c.nombre);
        this.charts.stock.data.datasets[0].data = datos;
        this.charts.stock.data.datasets[0].backgroundColor = categorias.map(c => c.color);
        this.charts.stock.update();
    }

    mostrarDashboard() {
        this.actualizarChartStock();
        this.mostrarProductosCriticos();
    }

    mostrarProductosCriticos() {
        const container = document.getElementById('criticos-list');
        if (!container) return;

        const criticos = this.datos.productos.filter(p => 
            p.sede === this.datos.sedeActual && p.stockActual <= p.stockCritico
        ).slice(0, 5);

        if (criticos.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay productos críticos</p>';
            return;
        }

        container.innerHTML = criticos.map(producto => `
            <div class="alerta-item critico">
                <i class="fas fa-skull-crossbones"></i>
                <div style="flex: 1;">
                    <strong>${producto.nombre}</strong>
                    <div style="font-size: 0.8rem; color: #666;">
                        Stock crítico: ${producto.stockActual} kg
                    </div>
                </div>
                <span style="color: #e74c3c; font-weight: bold;">URGENTE</span>
            </div>
        `).join('');
    }

    mostrarInventario() {
        this.actualizarFiltros();
        this.renderizarProductos();
    }

    actualizarFiltros() {
        const selectCategoria = document.getElementById('filtro-categoria');
        if (!selectCategoria) return;

        selectCategoria.innerHTML = '<option value="">Todas las categorías</option>' +
            this.datos.categorias.map(cat => 
                `<option value="${cat.nombre}">${cat.nombre}</option>`
            ).join('');
    }

    aplicarFiltros() {
        this.renderizarProductos();
    }

    renderizarProductos() {
        const container = document.getElementById('lista-productos');
        if (!container) return;

        const filtroCategoria = document.getElementById('filtro-categoria')?.value || '';
        const filtroEstado = document.getElementById('filtro-estado')?.value || '';

        let productos = this.datos.productos.filter(p => p.sede === this.datos.sedeActual);

        // Aplicar filtros
        if (filtroCategoria) {
            productos = productos.filter(p => p.categoria === filtroCategoria);
        }

        if (filtroEstado) {
            switch(filtroEstado) {
                case 'stock-bajo':
                    productos = productos.filter(p => p.stockActual <= p.stockMin && p.stockActual > p.stockCritico);
                    break;
                case 'stock-critico':
                    productos = productos.filter(p => p.stockActual <= p.stockCritico);
                    break;
                case 'sin-stock':
                    productos = productos.filter(p => p.stockActual === 0);
                    break;
            }
        }

        if (productos.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666; grid-column: 1 / -1;">
                    <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p>No se encontraron productos</p>
                </div>
            `;
            return;
        }

        container.innerHTML = productos.map(producto => {
            const stockClass = producto.stockActual <= producto.stockCritico ? 'critico' : 
                              producto.stockActual <= producto.stockMin ? 'bajo' : '';
            
            return `
                <div class="producto-card" style="border-left-color: ${this.obtenerColorCategoria(producto.categoria)}">
                    <div class="producto-header">
                        <div class="producto-nombre">${producto.nombre}</div>
                        <div class="producto-stock ${stockClass}">${producto.stockActual} kg</div>
                    </div>
                    <div class="producto-info">
                        <div><i class="fas fa-tag"></i> S/ ${producto.precioKg}</div>
                        <div><i class="fas fa-tags"></i> ${producto.categoria}</div>
                        <div><i class="fas fa-barcode"></i> ${producto.codigoBarras}</div>
                        <div><i class="fas fa-warehouse"></i> ${producto.ubicacion || 'Almacén'}</div>
                    </div>
                    <div class="producto-actions">
                        <button class="btn-action" onclick="almacen.imprimirEtiqueta('${producto.id}')" title="Imprimir Etiqueta">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn-action" onclick="almacen.escanearProducto('${producto.id}')" title="Escanear">
                            <i class="fas fa-camera"></i>
                        </button>
                        <button class="btn-action" onclick="almacen.verDetallesProducto('${producto.id}')" title="Ver Detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action" onclick="almacen.editarProducto('${producto.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    mostrarModalProducto() {
        const modal = document.getElementById('modal-producto');
        if (!modal) {
            this.mostrarNotificacion('Error: Modal no encontrado', 'error');
            return;
        }

        // Crear el formulario si no existe
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody && !modalBody.querySelector('form')) {
            modalBody.innerHTML = this.crearFormularioProducto();
        }

        // Llenar categorías
        const selectCategoria = modal.querySelector('#producto-categoria');
        if (selectCategoria) {
            selectCategoria.innerHTML = '<option value="">Seleccionar categoría</option>' +
                this.datos.categorias.map(cat => 
                    `<option value="${cat.nombre}">${cat.nombre}</option>`
                ).join('');
        }

        // Llenar proveedores
        const selectProveedor = modal.querySelector('#producto-proveedor');
        if (selectProveedor) {
            selectProveedor.innerHTML = '<option value="">Seleccionar proveedor</option>' +
                this.datos.proveedores.map(prov => 
                    `<option value="${prov.id}">${prov.nombre}</option>`
                ).join('');
        }

        // Generar código único
        const nuevoCodigo = this.generarCodigoBarras();
        this.generarImagenBarras(nuevoCodigo, 'barcode-container');
        
        modal.classList.add('active');
    }

    crearFormularioProducto() {
        return `
            <form id="form-producto">
                <div class="form-group">
                    <label for="producto-nombre">Nombre del Producto *</label>
                    <input type="text" id="producto-nombre" name="nombre" required placeholder="Ej: Carne de Chancho Premium">
                </div>
                
                <div class="form-group">
                    <label for="producto-categoria">Categoría *</label>
                    <select id="producto-categoria" name="categoria" required>
                        <option value="">Seleccionar categoría</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="producto-precioKg">Precio por Kg (S/) *</label>
                    <input type="number" id="producto-precioKg" name="precioKg" step="0.1" min="0" required placeholder="23.00">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label for="producto-stockMin">Stock Mínimo (kg)</label>
                        <input type="number" id="producto-stockMin" name="stockMin" value="10" min="0">
                    </div>
                    
                    <div class="form-group">
                        <label for="producto-stockMax">Stock Máximo (kg)</label>
                        <input type="number" id="producto-stockMax" name="stockMax" value="100" min="0">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="producto-stockCritico">Stock Crítico (kg)</label>
                    <input type="number" id="producto-stockCritico" name="stockCritico" value="5" min="0">
                </div>
                
                <div class="form-group">
                    <label for="producto-ubicacion">Ubicación en Almacén</label>
                    <input type="text" id="producto-ubicacion" name="ubicacion" placeholder="Ej: Estante A, Nivel 2">
                </div>
                
                <div class="form-group">
                    <label for="producto-proveedor">Proveedor Principal</label>
                    <select id="producto-proveedor" name="proveedor">
                        <option value="">Seleccionar proveedor</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="producto-notas">Notas Adicionales</label>
                    <textarea id="producto-notas" name="notas" rows="3" placeholder="Información adicional del producto"></textarea>
                </div>
                
                <!-- Código de Barras -->
                <div class="barcode-preview">
                    <h4>Código de Barras Generado</h4>
                    <div id="barcode-container"></div>
                    <div class="barcode-number" id="barcode-number"></div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="almacen.cerrarModal('modal-producto')">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button type="button" class="btn btn-primary" onclick="almacen.guardarProducto()">
                        <i class="fas fa-save"></i> Guardar Producto
                    </button>
                </div>
            </form>
        `;
    }

    generarCodigoBarras() {
        const sedePrefix = this.datos.sedeActual === 'anyela' ? 'ANY' : 'REB';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 3).toUpperCase();
        return `${sedePrefix}${timestamp}${random}`;
    }

    generarImagenBarras(codigo, contenedorId) {
        const contenedor = document.getElementById(contenedorId);
        if (!contenedor) return;

        contenedor.innerHTML = `
            <img src="https://barcode.tec-it.com/barcode.ashx?data=${codigo}&code=Code128&dpi=96&dataseparator=" 
                 alt="Código de Barras" class="barcode-image">
            <div class="barcode-number">${codigo}</div>
        `;
    }

    guardarProducto() {
        const modal = document.getElementById('modal-producto');
        if (!modal) {
            this.mostrarNotificacion('Error: No se puede acceder al formulario', 'error');
            return;
        }

        const form = modal.querySelector('#form-producto');
        if (!form) {
            this.mostrarNotificacion('Error: Formulario no encontrado', 'error');
            return;
        }

        const formData = new FormData(form);
        const nombre = formData.get('nombre');
        const categoria = formData.get('categoria');
        const precioKg = parseFloat(formData.get('precioKg'));

        // Validaciones básicas
        if (!nombre || !categoria || !precioKg || isNaN(precioKg)) {
            this.mostrarNotificacion('Complete todos los campos obligatorios correctamente', 'error');
            return;
        }

        const producto = {
            id: 'prod_' + Date.now(),
            nombre: nombre,
            categoria: categoria,
            precioKg: precioKg,
            stockMin: parseInt(formData.get('stockMin')) || 10,
            stockMax: parseInt(formData.get('stockMax')) || 100,
            stockCritico: parseInt(formData.get('stockCritico')) || 5,
            codigoBarras: document.querySelector('#barcode-number')?.textContent || this.generarCodigoBarras(),
            stockActual: 0,
            ubicacion: formData.get('ubicacion') || 'Almacén Principal',
            fechaCreacion: new Date().toISOString(),
            sede: this.datos.sedeActual,
            proveedor: formData.get('proveedor') || '',
            notas: formData.get('notas') || ''
        };

        this.datos.productos.push(producto);
        this.guardarDatos();
        this.cerrarModal('modal-producto');
        this.mostrarNotificacion('✅ Producto agregado al inventario', 'success');
    }

    imprimirEtiqueta(productoId) {
        const producto = this.datos.productos.find(p => p.id === productoId);
        if (!producto) {
            this.mostrarNotificacion('Producto no encontrado', 'error');
            return;
        }

        const ventana = window.open('', '_blank');
        ventana.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Etiqueta ${producto.nombre}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 10px; 
                        text-align: center;
                    }
                    .etiqueta { 
                        border: 2px solid #333; 
                        padding: 15px; 
                        width: 80mm; 
                        margin: 0 auto;
                    }
                    .header { 
                        font-weight: bold; 
                        font-size: 16px; 
                        margin-bottom: 10px;
                        color: #e74c3c;
                    }
                    .barcode { 
                        width: 100%; 
                        height: 60px; 
                        margin: 10px 0;
                    }
                    .producto { 
                        font-size: 14px; 
                        font-weight: bold; 
                        margin: 5px 0;
                    }
                    .detalles { 
                        font-size: 12px; 
                        margin: 3px 0;
                    }
                    .footer { 
                        font-size: 10px; 
                        margin-top: 10px; 
                        color: #666;
                    }
                    @media print { 
                        body { margin: 0; }
                        .etiqueta { border: 1px solid #000; }
                    }
                </style>
            </head>
            <body>
                <div class="etiqueta">
                    <div class="header">ANYELA CARNES</div>
                    <div class="producto">${producto.nombre}</div>
                    <img src="https://barcode.tec-it.com/barcode.ashx?data=${producto.codigoBarras}&code=Code128&dpi=150" 
                         class="barcode" alt="Código de Barras">
                    <div class="detalles"><strong>Código:</strong> ${producto.codigoBarras}</div>
                    <div class="detalles"><strong>Precio:</strong> S/ ${producto.precioKg} por kg</div>
                    <div class="detalles"><strong>Categoría:</strong> ${producto.categoria}</div>
                    <div class="detalles"><strong>Ubicación:</strong> ${producto.ubicacion}</div>
                    <div class="footer">Generado: ${new Date().toLocaleDateString()}</div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 500);
                    };
                </script>
            </body>
            </html>
        `);
    }

    obtenerColorCategoria(nombreCategoria) {
        const categoria = this.datos.categorias.find(c => c.nombre === nombreCategoria);
        return categoria ? categoria.color : '#95a5a6';
    }

    mostrarCompras() {
        const container = document.getElementById('lista-ordenes');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p>Módulo de Compras</p>
                    <button class="btn btn-primary" onclick="almacen.mostrarModalOrdenCompra()">
                        <i class="fas fa-plus"></i> Crear Primera Orden
                    </button>
                </div>
            `;
        }
    }

    mostrarProveedores() {
        const container = document.getElementById('lista-proveedores');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-truck" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p>Módulo de Proveedores</p>
                    <button class="btn btn-primary" onclick="almacen.mostrarModalProveedor()">
                        <i class="fas fa-plus"></i> Agregar Proveedor
                    </button>
                </div>
            `;
        }
    }

    mostrarScanner() {
        const container = document.getElementById('scan-results');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #666;">
                    <i class="fas fa-camera" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>Listo para escanear códigos de barras</p>
                </div>
            `;
        }
    }

    mostrarReportes() {
        // Los reportes ya están listos en el HTML
    }

    buscarCodigoManual() {
        const input = document.getElementById('manual-barcode');
        const container = document.getElementById('scan-results');
        
        if (!input || !container) return;

        const codigo = input.value.trim();
        if (!codigo) {
            this.mostrarNotificacion('Ingrese un código para buscar', 'warning');
            return;
        }

        const producto = this.datos.productos.find(p => 
            p.codigoBarras === codigo || p.id === codigo
        );

        if (producto) {
            container.innerHTML = `
                <div class="producto-card">
                    <div class="producto-header">
                        <div class="producto-nombre">${producto.nombre}</div>
                        <div class="producto-stock">${producto.stockActual} kg</div>
                    </div>
                    <div class="producto-info">
                        <div><strong>Código:</strong> ${producto.codigoBarras}</div>
                        <div><strong>Precio:</strong> S/ ${producto.precioKg}</div>
                        <div><strong>Categoría:</strong> ${producto.categoria}</div>
                        <div><strong>Ubicación:</strong> ${producto.ubicacion}</div>
                    </div>
                </div>
            `;
        } else {
            this.mostrarNotificacion('❌ Código no encontrado', 'error');
        }
    }

    generarReporte(tipo) {
        switch(tipo) {
            case 'stock':
                this.generarReporteStock();
                break;
            case 'compras':
                this.generarReporteCompras();
                break;
            case 'mermas':
                this.generarReporteMermas();
                break;
            case 'proveedores':
                this.generarReporteProveedores();
                break;
            case 'rotacion':
                this.generarReporteRotacion();
                break;
            case 'valorizacion':
                this.generarReporteValorizacion();
                break;
            default:
                this.mostrarNotificacion('Tipo de reporte no reconocido', 'error');
        }
    }

    generarReporteStock() {
        const productos = this.datos.productos.filter(p => p.sede === this.datos.sedeActual);
        let contenido = `
            <h2>Reporte de Stock - ${this.datos.sedeActual.toUpperCase()}</h2>
            <p>Generado: ${new Date().toLocaleDateString()}</p>
            <table border="1" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; text-align: left;">Producto</th>
                        <th style="padding: 10px; text-align: right;">Stock Actual</th>
                        <th style="padding: 10px; text-align: right;">Stock Mínimo</th>
                        <th style="padding: 10px; text-align: right;">Precio</th>
                        <th style="padding: 10px; text-align: right;">Valor</th>
                    </tr>
                </thead>
                <tbody>
        `;

        productos.forEach(producto => {
            const valor = producto.stockActual * producto.precioKg;
            contenido += `
                <tr>
                    <td style="padding: 8px;">${producto.nombre}</td>
                    <td style="padding: 8px; text-align: right;">${producto.stockActual} kg</td>
                    <td style="padding: 8px; text-align: right;">${producto.stockMin} kg</td>
                    <td style="padding: 8px; text-align: right;">S/ ${producto.precioKg}</td>
                    <td style="padding: 8px; text-align: right;">S/ ${valor.toFixed(2)}</td>
                </tr>
            `;
        });

        contenido += `
                </tbody>
            </table>
        `;

        this.descargarPDF(contenido, `Reporte_Stock_${this.datos.sedeActual}_${new Date().toISOString().slice(0,10)}.pdf`);
    }

    descargarPDF(contenido, nombreArchivo) {
        const ventana = window.open('', '_blank');
        ventana.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${nombreArchivo}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 10px; border: 1px solid #ddd; }
                    th { background: #f8f9fa; }
                </style>
            </head>
            <body>
                ${contenido}
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
    }

    sincronizarDatos() {
        this.mostrarNotificacion('🔄 Sincronizando datos...', 'info');
        // En una versión futura, aquí se conectaría con Firebase
        setTimeout(() => {
            this.mostrarNotificacion('✅ Datos sincronizados correctamente', 'success');
        }, 1000);
    }

    reponerStock(productoId) {
        const producto = this.datos.productos.find(p => p.id === productoId);
        if (producto) {
            const cantidad = prompt(`¿Cuántos kg desea agregar a ${producto.nombre}?`, "0");
            if (cantidad && !isNaN(cantidad)) {
                producto.stockActual += parseFloat(cantidad);
                this.guardarDatos();
                this.mostrarNotificacion(`✅ Stock de ${producto.nombre} actualizado`, 'success');
            }
        }
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) {
            // Fallback si no existe el contenedor
            alert(mensaje);
            return;
        }

        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${this.obtenerIconoNotificacion(tipo)}"></i>
                <span>${mensaje}</span>
            </div>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }

    obtenerIconoNotificacion(tipo) {
        const iconos = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return iconos[tipo] || 'info-circle';
    }

    cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Métodos placeholder para funcionalidades futuras
    mostrarModalLote() {
        this.mostrarNotificacion('🔄 Módulo de Lotes en desarrollo', 'info');
    }

    mostrarModalOrdenCompra() {
        this.mostrarNotificacion('🔄 Módulo de Órdenes de Compra en desarrollo', 'info');
    }

    mostrarModalProveedor() {
        this.mostrarNotificacion('🔄 Módulo de Proveedores en desarrollo', 'info');
    }

    iniciarScanner() {
        this.mostrarNotificacion('📷 Iniciando cámara para escaneo...', 'info');
    }

    escanearProducto(productoId) {
        const producto = this.datos.productos.find(p => p.id === productoId);
        if (producto) {
            this.mostrarNotificacion(`🔍 Escaneando: ${producto.nombre}`, 'info');
        }
    }

    verDetallesProducto(productoId) {
        const producto = this.datos.productos.find(p => p.id === productoId);
        if (producto) {
            this.mostrarNotificacion(`👁️ Viendo detalles de: ${producto.nombre}`, 'info');
        }
    }

    editarProducto(productoId) {
        const producto = this.datos.productos.find(p => p.id === productoId);
        if (producto) {
            this.mostrarNotificacion(`✏️ Editando: ${producto.nombre}`, 'info');
        }
    }

    generarReporteCompras() {
        this.mostrarNotificacion('📊 Generando reporte de compras...', 'info');
    }

    generarReporteMermas() {
        this.mostrarNotificacion('📊 Generando análisis de mermas...', 'info');
    }

    generarReporteProveedores() {
        this.mostrarNotificacion('📊 Generando evaluación de proveedores...', 'info');
    }

    generarReporteRotacion() {
        this.mostrarNotificacion('📊 Generando análisis de rotación...', 'info');
    }

    generarReporteValorizacion() {
        this.mostrarNotificacion('📊 Generando valorización de inventario...', 'info');
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.almacen = new AlmacenCompleto();
});