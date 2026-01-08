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

let editingCourseData = null;

async function openEditOrderModal() {
    console.log("Редактирование заявки");
    try {
        const orderRes = await fetch(`${API_BASE}/orders/${selectedOrderId}?api_key=${API_KEY}`);
        if (!orderRes.ok) throw new Error('Ошибка получения заявки');
        const order = await orderRes.json();

        if (!order.course_id) {
            showNotification('Редактирование доступно только для курсов', 'warning');
            return;
        }

        const courseRes = await fetch(`${API_BASE}/courses/${order.course_id}?api_key=${API_KEY}`);
        if (!courseRes.ok) throw new Error('Ошибка получения курса');
        editingCourseData = await courseRes.json();

        const overlay = createOverlay('editOrderModalOverlay');
        overlay.innerHTML = `
            <div class="custom-modal">
                <div class="custom-modal-header">
                    <h5 class="custom-modal-title">Редактирование заявки на курс #${order.id}</h5>
                    <button class="custom-modal-close" onclick="closeOverlay('editOrderModalOverlay')">×</button>
                </div>
                <div class="custom-modal-body">
                    <form id="editOrderForm">
                        <!-- Название и преподаватель -->
                        <div class="row mb-2">
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Название курса</label>
                                <input type="text" class="form-control" value="${editingCourseData.name}" readonly>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Преподаватель</label>
                                <input type="text" class="form-control" value="${editingCourseData.teacher}" readonly>
                            </div>
                        </div>

                        <!-- Дата и время -->
                        <div class="row mb-2">
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Дата начала</label>
                                <select class="form-select" id="editStartDateSelect" required>
                                    <option value="">Выберите дату</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Время занятия</label>
                                <select class="form-select" id="editTimeSelect" disabled required>
                                    <option value="">Сначала выберите дату</option>
                                </select>
                            </div>
                        </div>

                        <!-- Продолжительность -->
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Продолжительность</label>
                            <input type="text" class="form-control" id="editDurationInfo" readonly>
                        </div>

                        <!-- Студенты -->
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Количество студентов (1–20)</label>
                            <input type="number" class="form-control" id="editStudentsCount" min="1" max="20" value="${order.persons}" required>
                        </div>

                        <!-- Доп. параметры -->
                        <div class="mb-2">
                            <h6 class="fw-semibold">Дополнительные услуги (опционально)</h6>
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
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="editIntensiveCourse" ${order.intensive_course ? 'checked' : ''}>
                                        <label class="form-check-label">Интенсивные курсы (+20%)</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Стоимость -->
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

        // Заполнение дат
        const dateSelect = document.getElementById('editStartDateSelect');
        const uniqueDates = [...new Set(editingCourseData.start_dates.map(d => d.split('T')[0]))];
        uniqueDates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = new Date(date).toLocaleDateString('ru-RU');
            dateSelect.appendChild(option);
        });

        // Предустановка значений
        dateSelect.value = order.date_start;
        updateEditTimeSlots();
        document.getElementById('editTimeSelect').value = order.time_start;

        // Слушатели
        dateSelect.addEventListener('change', updateEditTimeSlots);
        document.getElementById('editStudentsCount').addEventListener('input', calculateEditCourseCost);
        document.querySelectorAll('#editOrderForm .form-check-input').forEach(chk => {
            chk.addEventListener('change', calculateEditCourseCost);
        });

        document.getElementById('saveEditBtn').addEventListener('click', submitEditCourseApply);

        // показываем
        overlay.classList.add('active');

        // Закрытие по overlay
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeOverlay('editOrderModalOverlay');
        });

        // Начальный расчет
        calculateEditCourseCost();
    } catch (e) {
        showNotification('Ошибка: ' + e.message, 'danger');
    }
}

// Время по дате для редактирования
function updateEditTimeSlots() {
    const date = document.getElementById('editStartDateSelect').value;
    const timeSelect = document.getElementById('editTimeSelect');
    timeSelect.innerHTML = '<option value="">Выберите время</option>';
    timeSelect.disabled = !date;

    if (date) {
        const times = editingCourseData.start_dates
            .filter(dt => dt.startsWith(date))
            .map(dt => dt.split('T')[1].substring(0, 5));

        times.forEach(t => {
            const end = addHours(t, editingCourseData.week_length);
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = `${t} – ${end}`;
            timeSelect.appendChild(opt);
        });
    }

    const weeks = editingCourseData.total_length;
    const start = new Date(date);
    const end = new Date(start);
    end.setDate(start.getDate() + weeks * 7);
    document.getElementById('editDurationInfo').value = `${weeks} недель (окончание: ${end.toLocaleDateString('ru-RU')})`;

    calculateEditCourseCost();
}

function addHours(time, hours) {
    const [h, m] = time.split(':').map(Number);
    return `${(h + hours).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

let groupEnrollment = false; //групповая заявка (флаг для студентов)
let earlyReg = false; //рання регистрация (больше чем за месяц)

// Расчёт стоимости для редактирования
function calculateEditCourseCost() {
    const students = parseInt(document.getElementById('editStudentsCount').value) || 1;
    const time = document.getElementById('editTimeSelect').value;
    if (!time) return document.getElementById('editTotalCost').value = '0 руб';

    let base = editingCourseData.course_fee_per_hour * editingCourseData.total_length * editingCourseData.week_length;

    // Weekend
    const day = new Date(document.getElementById('editStartDateSelect').value).getDay();
    if (day === 0 || day === 6) base *= 1.5;

    // Morning/evening
    const hour = parseInt(time.split(':')[0]);
    base += ((hour >= 9 && hour < 12) ? 400 : 0) * students;
    base += ((hour >= 18 && hour < 20) ? 1000 : 0) * students;

    // * students
    base *= students;

    // Опции
    if (document.getElementById('editSupplementary').checked) base += 2000 * students;
    if (document.getElementById('editPersonalized').checked) base += 1500 * editingCourseData.total_length;
    if (document.getElementById('editExcursions').checked) base *= 1.25;
    if (document.getElementById('editAssessment').checked) base += 300;
    if (document.getElementById('editInteractive').checked) base *= 1.5;
    if (document.getElementById('editIntensiveCourse').checked) base *= 1.2;


    //АВТОМАТИЧЕСКИЕ СКИДКИ
    const startDate = new Date(document.getElementById('editStartDateSelect').value);
    const today = new Date();
    
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // Расчет разницы в месяцах
    const monthsDiff = (startDate.getFullYear() - today.getFullYear()) * 12 +  (startDate.getMonth() - today.getMonth());
    
    // Если разница больше 1 месяца (больше чем за месяц)
    if (monthsDiff > 1 || (monthsDiff === 1 && startDate.getDate() >= today.getDate())) {
        base *= 0.9; // Скидка 10%
        earlyReg = true;
    } else {
        earlyReg = false;
    }
    
    // Групповая скидка
    if (students >= 5) {
        base *= 0.85;
        groupEnrollment = true;
    } else {
        groupEnrollment = false;
    };
    
    if (editingCourseData.week_length >= 5) base *= 1.2;

    document.getElementById('editTotalCost').value = Math.round(base) + ' руб';
}

// Отправка редактирования (PUT)
async function submitEditCourseApply() {
    calculateEditCourseCost();
    const data = {
        course_id: editingCourseData.id,
        tutor_id: 0,
        date_start: document.getElementById('editStartDateSelect').value,
        time_start: document.getElementById('editTimeSelect').value,
        duration: editingCourseData.total_length * editingCourseData.week_length,
        persons: parseInt(document.getElementById('editStudentsCount').value),
        price: parseInt(document.getElementById('editTotalCost').value.replace(' руб', '')),
        supplementary: document.getElementById('editSupplementary').checked,
        personalized: document.getElementById('editPersonalized').checked,
        excursions: document.getElementById('editExcursions').checked,
        assessment: document.getElementById('editAssessment').checked,
        interactive: document.getElementById('editInteractive').checked,
        intensive_course: document.getElementById('editIntensiveCourse').checked,
        group_enrollment: groupEnrollment,
        early_registration: earlyReg
    };

    try {
        const res = await fetch(`${API_BASE}/orders/${selectedOrderId}?api_key=${API_KEY}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            alert("❌❌❌Ошибка! Студентов должно быть не более 20!❌❌❌");
            throw new Error('Ошибка');
        };
        console.log('Заявка обновлена!');
        closeOverlay('editOrderModalOverlay');
        showNotification('Заявка изменена!', 'success');
        window.load_orders();
    } catch (e) {
        showNotification('Не удалось изменить заявку!', 'danger');
        console.error(e);
    }
}

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