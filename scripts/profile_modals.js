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

// 2. Подробнее (GET + расчёт скидок/надбавок)
function openViewOrderModal() {
    console.log("Просмотр заявки");
    fetch(`${API_BASE}/orders/${selectedOrderId}?api_key=${API_KEY}`)
        .then(res => {
            if (!res.ok) throw new Error('Ошибка получения заявки');
            return res.json();
        })
        .then(order => {
            let discounts = '';
            let surcharges = '';
            if (order.early_registration) discounts += 'Ранняя регистрация (-10%), ';
            if (order.group_enrollment) discounts += 'Группа (-15%), ';
            if (order.intensive_course) surcharges += 'Интенсив (+20%), ';
            if (order.supplementary) surcharges += 'Доп. материалы (+2000руб/студент), ';
            if (order.personalized) surcharges += 'Индивидуальные (+1500руб/неделя), ';
            if (order.excursions) surcharges += 'Экскурсии (+25%), ';
            if (order.assessment) surcharges += 'Оценка (+300руб), ';
            if (order.interactive) surcharges += 'Интерактив (+50%), ';

            const overlay = createOverlay('viewOrderModalOverlay');
            overlay.innerHTML = `
                <div class="custom-modal">
                    <div class="custom-modal-header">
                        <h5 class="custom-modal-title">Подробнее о заявке #${order.id}</h5>
                        <button class="custom-modal-close" onclick="closeOverlay('viewOrderModalOverlay')">×</button>
                    </div>
                    <div class="custom-modal-body">
                        <p><strong>Курс/Репетитор:</strong> ${order.course_id ? `Курс ${order.course_id}` : `Репетитор ${order.tutor_id}`}</p>
                        <p><strong>Дата начала:</strong> ${order.date_start}</p>
                        <p><strong>Время начала:</strong> ${order.time_start}</p>
                        <p><strong>Продолжительность:</strong> ${order.duration} ч</p>
                        <p><strong>Студентов:</strong> ${order.persons}</p>
                        <p><strong>Стоимость:</strong> ${order.price} руб</p>
                        <p><strong>Скидки:</strong> ${discounts || 'Нет'}</p>
                        <p><strong>Дополнительные услуги:</strong> ${surcharges || 'Нет'}</p>
                    </div>
                    <div class="custom-modal-footer">
                        <button class="btn btn-secondary" onclick="closeOverlay('viewOrderModalOverlay')">Закрыть</button>
                    </div>
                </div>
            `;
            overlay.classList.add('active');
        })
        .catch(e => showNotification('Ошибка загрузки: ' + e.message, 'danger'));
}

// 3. Редактирование (GET + PUT) //

function openEditOrderModal() {
    console.log("Редактирование заявки");
    fetch(`${API_BASE}/orders/${selectedOrderId}?api_key=${API_KEY}`)
        .then(res => {
            if (!res.ok) throw new Error('Ошибка получения');
            return res.json();
        })
        .then(order => {
            const overlay = createOverlay('editOrderModalOverlay');
            overlay.innerHTML = `
                <div class="custom-modal">
                    <div class="custom-modal-header">
                        <h5 class="custom-modal-title">Редактирование заявки #${order.id}</h5>
                        <button class="custom-modal-close" onclick="closeOverlay('editOrderModalOverlay')">×</button>
                    </div>
                    <div class="custom-modal-body">
                        <form id="editOrderForm">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Дата начала</label>
                                    <input type="date" class="form-control" id="editStartDate" value="${order.date_start}" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Время начала</label>
                                    <input type="time" class="form-control" id="editTimeStart" value="${order.time_start}" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-semibold">Продолжительность (ч)</label>
                                <input type="number" class="form-control" id="editDuration" value="${order.duration}" min="1" max="40" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-semibold">Количество студентов (1–20)</label>
                                <input type="number" class="form-control" id="editPersons" value="${order.persons}" min="1" max="20" required>
                            </div>
                            <div class="mb-3">
                                <h6 class="fw-semibold">Дополнительные услуги</h6>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="editSupplementary" ${order.supplementary ? 'checked' : ''}>
                                            <label class="form-check-label">Доп. материалы (+2000 ₽/студент)</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="editPersonalized" ${order.personalized ? 'checked' : ''}>
                                            <label class="form-check-label">Индивидуальные занятия (+1500 ₽/неделя)</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="editExcursions" ${order.excursions ? 'checked' : ''}>
                                            <label class="form-check-label">Культурные экскурсии (+25%)</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="editAssessment" ${order.assessment ? 'checked' : ''}>
                                            <label class="form-check-label">Оценка уровня (+300 ₽)</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="editInteractive" ${order.interactive ? 'checked' : ''}>
                                            <label class="form-check-label">Интерактивная платформа (+50%)</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold fs-5">Общая стоимость</label>
                                <input type="text" class="form-control fw-bold fs-4 text-success" id="editTotalCost" readonly value="${order.price} руб">
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

            // Live-расчёт стоимости (как в создании)
            const calcCost = () => {
                const students = parseInt(document.getElementById('editPersons').value) || 1;
                const time = document.getElementById('editTimeStart').value;
                if (!time) return document.getElementById('editTotalCost').value = '0 руб';

                let base = 500 * 10; // Замени на реальные данные из order (fee_per_hour, duration и т.д.)
                // Здесь нужно знать fee_per_hour и duration из order — если их нет, сделаем GET-запрос на курс/репетитора
                // Пока заглушка — 500 руб/ч * 10 ч
                // Weekend/morning/evening — как в создании

                // Опции
                if (document.getElementById('editSupplementary').checked) base += 2000 * students;
                // Добавь остальные

                document.getElementById('editTotalCost').value = Math.round(base) + ' руб';
            };

            document.getElementById('editPersons').addEventListener('input', calcCost);
            // Добавь слушатели на чекбоксы
            document.querySelectorAll('#editOrderForm .form-check-input').forEach(chk => chk.addEventListener('change', calcCost));

            document.getElementById('saveEditBtn').onclick = async () => {
                const data = {
                    date_start: document.getElementById('editStartDate').value,
                    time_start: document.getElementById('editTimeStart').value,
                    duration: parseInt(document.getElementById('editDuration').value),
                    persons: parseInt(document.getElementById('editPersons').value),
                    supplementary: document.getElementById('editSupplementary').checked,
                    personalized: document.getElementById('editPersonalized').checked,
                    excursions: document.getElementById('editExcursions').checked,
                    assessment: document.getElementById('editAssessment').checked,
                    interactive: document.getElementById('editInteractive').checked,

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
        })
        .catch(e => showNotification('Ошибка: ' + e.message, 'danger'));
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