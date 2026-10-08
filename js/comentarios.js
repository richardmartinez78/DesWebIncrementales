import { obtenerResenasProducto, agregarResena } from './resenas.js';
import { obtenerSesion } from './base.js';

export async function renderizarSeccionOpiniones(productoId) {
    const contenedor = document.getElementById('contenedor-opiniones');
    if (!contenedor) return;

    const usuario = obtenerSesion();
    const resenas = await obtenerResenasProducto(productoId);

    // Formulario de opiniones (Sólo si hay usuario autenticado)
    const formularioHTML = usuario ? `
        <form id="form-opinion" class="card border-0 shadow-sm p-3 mb-4 bg-light">
            <h5 class="h6 fw-bold mb-2">Deja tu opinión como: <span class="text-success">${usuario.nombre || usuario.email}</span></h5>
            
            <div class="mb-3">
                <label for="puntuacion" class="form-label small fw-bold mb-1">Puntuación:</label>
                <select id="puntuacion" class="form-select form-select-sm" style="max-width: 200px;" required>
                    <option value="">Selecciona...</option>
                    <option value="5">⭐⭐⭐⭐⭐ (5/5) Excelente</option>
                    <option value="4">⭐⭐⭐⭐ (4/5) Muy Bueno</option>
                    <option value="3">⭐⭐⭐ (3/5) Bueno</option>
                    <option value="2">⭐⭐ (2/5) Regular</option>
                    <option value="1">⭐ (1/5) Deficiente</option>
                </select>
            </div>

            <div class="mb-2">
                <label for="comentario" class="form-label small fw-bold mb-1">Comentario:</label>
                <textarea id="comentario" class="form-control form-control-sm" rows="3" 
                          maxlength="500" placeholder="Escribe tu experiencia con el producto (Mínimo 10 caracteres)..." required></textarea>
                <div class="d-flex justify-content-between mt-1 extra-small text-muted" style="font-size: 0.75rem;">
                    <span id="error-comentario-morf" class="text-danger"></span>
                    <span id="contador-caracteres">0 / 500</span>
                </div>
            </div>

            <button type="submit" id="btn-enviar-opinion" class="btn btn-sm text-white fw-bold align-self-start" style="background-color: #146c43;">
                Publicar Opinión
            </button>
        </form>
    ` : `
        <div class="alert alert-warning small d-flex align-items-center gap-2 mb-4">
            <span>Debes <a href="perfil.html" class="alert-link">iniciar sesión</a> para opinar sobre este producto.</span>
        </div>
    `;

    // Lista de opiniones recibidas
    const listaHTML = resenas.map(r => `
        <div class="border-bottom py-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <strong class="small">${r.usuario?.nombre || 'Cliente'}</strong>
                <span class="text-muted extra-small" style="font-size: 0.75rem;">${r.fecha}</span>
            </div>
            <div class="text-warning mb-1">${'★'.repeat(r.calificacion)}${'☆'.repeat(5 - r.calificacion)}</div>
            <p class="small text-secondary mb-0">${r.comentario}</p>
        </div>
    `).join('') || '<p class="text-muted small py-2">Este producto aún no cuenta con opiniones.</p>';

    contenedor.innerHTML = `
        <h4 class="h5 fw-bold mb-3">Opiniones de Clientes</h4>
        ${formularioHTML}
        <div id="lista-opiniones">${listaHTML}</div>
    `;

    // Eventos del formulario
    if (usuario) {
        const textarea = document.getElementById('comentario');
        const contador = document.getElementById('contador-caracteres');

        textarea?.addEventListener('input', () => {
            if (contador) contador.textContent = `${textarea.value.length} / 500`;
        });

        document.getElementById('form-opinion')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const puntuacion = document.getElementById('puntuacion').value;
            const comentario = textarea.value;

            const exito = await agregarResena(productoId, puntuacion, comentario);
            if (exito) {
                renderizarSeccionOpiniones(productoId);
            }
        });
    }
}