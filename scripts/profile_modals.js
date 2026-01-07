let selectedOrderID = null;

const API_KEY = '93f2f89f-4f0d-4dda-ba66-ae4884769bb4';
const API_BASE = 'http://exam-api-courses.std-900.ist.mospolytech.ru/api';

// 1. Подтверждение удаления
function openDeleteConfirmModal() {
    console.log("удаление заявки");
    const overlay = createOverlay('deleteConfirmModalOverlay');
    overlay.innerHTML = `
        <div class="custom-modal active">
            <div class="custom-modal-header">
                <h3 class="custom-modal-title">Подтверждение удаления</h3>
                <button class="custom-modal-close" onclick="closeOverlay('deleteConfirmModalOverlay')">×</button>
            </div>
            <div class="custom-modal-body">
                <p class="text-center py-2 fs-4">Вы уверены, что хотите удалить заявку?</p>
            </div>
            <div class="custom-modal-footer">
                <button class="btn btn-secondary me-3" onclick="closeOverlay('deleteConfirmModalOverlay')">Отмена</button>
                <button class="btn btn-danger" id="confirmDeleteBtn">Да, удалить</button>
            </div>
        </div>
    `;
    overlay.classList.add('active');

    document.getElementById('confirmDeleteBtn').onclick = async () => {
        try {
            const res = await fetch(`${API_BASE}/orders/${selectedOrderId}?api_key=${API_KEY}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Ошибка удаления');
            showNotification('Заявка удалена', 'success');
            closeOverlay('deleteConfirmModalOverlay');
            window.load_orders();
        } catch (e) {
            showNotification('Ошибка: ' + e.message, 'danger');
        }
    };
}

// 2. Подробнее о заявке
function openViewOrderModal() {
    console.log("просмотр заявки");
    const order = window.orders_data.find(o => o.id == selectedOrderId);
    if (!order) return;

    const overlay = createOverlay('viewOrderModalOverlay');
    overlay.innerHTML = `
        <div class="custom-modal active">
            <div class="custom-modal-header">
                <h5 class="custom-modal-title">Подробнее о заявке #${order.id}</h5>
                <button class="custom-modal-close" onclick="closeOverlay('viewOrderModalOverlay')">×</button>
            </div>
            <div class="custom-modal-body">
                <p><strong>Курс/Репетитор:</strong> ${order.course_id ? `Курс ${order.course_id}` : `Репетитор ${order.tutor_id}`}</p>
                <p><strong>Дата:</strong> ${order.date_start}</p>
                <p><strong>Время:</strong> ${order.time_start}</p>
                <p><strong>Продолжительность:</strong> ${order.duration} ч</p>
                <p><strong>Студентов:</strong> ${order.persons}</p>
                <p><strong>Стоимость:</strong> ${order.price} руб</p>
                <p><strong>Опции:</strong> ${Object.keys(order).filter(k => k.endsWith('_') && order[k]).join(', ') || 'нет'}</p>
            </div>
            <div class="custom-modal-footer">
                <button class="btn btn-secondary" onclick="closeOverlay('viewOrderModalOverlay')">Закрыть</button>
            </div>
        </div>
    `;
    overlay.classList.add('active');
}

// 3. Редактирование заявки
function openEditOrderModal() {
    console.log("редактирование заявки");
    const order = window.orders_data.find(o => o.id == selectedOrderId);
    if (!order) return;

    const overlay = createOverlay('editOrderModalOverlay');
    overlay.innerHTML = `
        <div class="custom-modal active">
            <div class="custom-modal-header">
                <h5 class="custom-modal-title">Редактирование заявки #${order.id}</h5>
                <button class="custom-modal-close" onclick="closeOverlay('editOrderModalOverlay')">×</button>
            </div>
            <div class="custom-modal-body">
                <form id="editOrderForm">
                    <div class="mb-3">
                        <label class="form-label">Дата начала</label>
                        <input type="date" class="form-control" id="editStartDate" value="${order.date_start}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Время начала</label>
                        <input type="time" class="form-control" id="editTimeStart" value="${order.time_start}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Продолжительность (ч)</label>
                        <input type="number" class="form-control" id="editDuration" value="${order.duration}" min="1" max="40" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Студентов (1–20)</label>
                        <input type="number" class="form-control" id="editPersons" value="${order.persons}" min="1" max="20" required>
                    </div>
                    <div class="mb-3">
                        <h6>Доп. параметры</h6>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="editSupplementary" ${order.supplementary ? 'checked' : ''}>
                            <label class="form-check-label">Доп. материалы</label>
                        </div>
                        <!-- Добавь остальные чекбоксы -->
                    </div>
                </form>
            </div>
            <div class="custom-modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeOverlay('editOrderModalOverlay')">Отмена</button>
                <button type="button" class="btn btn-primary" id="saveEditBtn">Сохранить</button>
            </div>
        </div>
    `;
    overlay.classList.add('active');

    document.getElementById('saveEditBtn').onclick = async () => {
        const data = {
            date_start: document.getElementById('editStartDate').value,
            time_start: document.getElementById('editTimeStart').value,
            duration: parseInt(document.getElementById('editDuration').value),
            persons: parseInt(document.getElementById('editPersons').value),
            supplementary: document.getElementById('editSupplementary').checked,
            // Добавь остальные
        };

        try {
            const res = await fetch(`${API_BASE}/orders/${selectedOrderId}?api_key=${API_KEY}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Ошибка редактирования');
            showNotification('Заявка обновлена');
            closeOverlay('editOrderModalOverlay');
            load_orders();
        } catch (e) {
            showNotification('Ошибка: ' + e.message, 'danger');
        }
    };
}

// Утилиты
function createOverlay(id) {
    let overlay = document.getElementById(id);
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = id;
        overlay.className = 'custom-modal-overlay';
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = '';
    return overlay;
}

function closeOverlay(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
    selectedOrderId = null;
}

// Уведомления
function showNotification(message, type = 'success') {
    const alertsBlock = document.getElementById('alertsBlock');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} mt-2 alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertsBlock.appendChild(alertDiv);

    // Авто-исчезновение через 5 секунд
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}