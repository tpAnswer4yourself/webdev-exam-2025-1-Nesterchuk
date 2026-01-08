//Динамическое модальное окно для заявки на курс

let selectedCourseForApply = null;
const API_KEY = '93f2f89f-4f0d-4dda-ba66-ae4884769bb4';
const API_BASE = 'http://exam-api-courses.std-900.ist.mospolytech.ru/api';

// Открытие модалки
function openCourseApplyModal(courseId) {
    selectedCourseForApply = window.courses_data.find(c => c.id == courseId);
    if (!selectedCourseForApply) {
        console.error('Курс не найден');
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'custom-modal-overlay';
    document.body.prepend(overlay);

    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    overlay.appendChild(modal);

    modal.innerHTML = `
        <div class="custom-modal-header">
            <h5 class="custom-modal-title">Оформление заявки на курс</h5>
            <button class="custom-modal-close" onclick="closeCourseModal()">×</button>
        </div>
        <div class="custom-modal-body">
            <form id="courseApplyForm">
                <!-- Название и преподаватель -->
                <div class="row mb-2">
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Название курса</label>
                        <input type="text" class="form-control" value="${selectedCourseForApply.name}" readonly>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Преподаватель</label>
                        <input type="text" class="form-control" value="${selectedCourseForApply.teacher}" readonly>
                    </div>
                </div>

                <!-- Дата и время — 2 колонки -->
                <div class="row mb-2">
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Дата начала</label>
                        <select class="form-select" id="startDateSelect" required>
                            <option value="">Выберите дату</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Время занятия</label>
                        <select class="form-select" id="timeSelect" disabled required>
                            <option value="">Сначала выберите дату</option>
                        </select>
                    </div>
                </div>

                <!-- Продолжительность -->
                <div class="mb-2">
                    <label class="form-label fw-semibold">Продолжительность</label>
                    <input type="text" class="form-control" id="durationInfo" readonly>
                </div>

                <!-- Студенты -->
                <div class="mb-2">
                    <label class="form-label fw-semibold">Количество студентов (1–20)</label>
                    <input type="number" class="form-control" id="studentsCount" min="1" max="20" value="1" required>
                </div>

                <!-- Доп. параметры -->
                <div class="mb-2">
                    <h6 class="fw-semibold">Дополнительные услуги (опционально)</h6>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="supplementary">
                                <label class="form-check-label">Доп. материалы (+2000 ₽/студент)</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="personalized">
                                <label class="form-check-label">Индивидуальные занятия (+1500 ₽/неделя)</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="excursions">
                                <label class="form-check-label">Культурные экскурсии (+25%)</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="assessment">
                                <label class="form-check-label">Оценка уровня (+300 ₽)</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="interactive">
                                <label class="form-check-label">Интерактивная платформа (+50%)</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="intensiveCourse">
                                <label class="form-check-label">Интенсивные курсы (+20%)</label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Стоимость -->
                <div class="mb-3">
                    <label class="form-label fw-bold fs-5">Общая стоимость</label>
                    <input type="text" class="form-control fw-bold fs-4 text-success" id="totalCost" readonly value="0 руб">
                </div>
            </form>
        </div>
        <div class="custom-modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeCourseModal()">Отмена</button>
            <button type="button" class="btn btn-primary" id="submitCourseApply">Отправить</button>
        </div>
    `;

    // Заполнение дат
    const dateSelect = document.getElementById('startDateSelect');
    const uniqueDates = [...new Set(selectedCourseForApply.start_dates.map(d => d.split('T')[0]))];
    uniqueDates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = new Date(date).toLocaleDateString('ru-RU');
        dateSelect.appendChild(option);
    });

    // Слушатели
    dateSelect.addEventListener('change', updateTimeSlots);
    document.getElementById('studentsCount').addEventListener('input', calculateCourseCost);
    document.querySelectorAll('#courseApplyForm .form-check-input').forEach(chk => {
        chk.addEventListener('change', calculateCourseCost);
    });

    document.getElementById('submitCourseApply').addEventListener('click', submitCourseApply);

    // Показываем
    overlay.classList.add('active');

    // Закрытие по overlay
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeCourseModal();
    });
}

// Закрытие
function closeCourseModal() {
    const overlay = document.querySelector('.custom-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
    selectedCourseForApply = null;
}

// Время по дате
function updateTimeSlots() {
    const date = document.getElementById('startDateSelect').value;
    const timeSelect = document.getElementById('timeSelect');
    timeSelect.innerHTML = '<option value="">Выберите время</option>';
    timeSelect.disabled = !date;

    if (date) {
        const times = selectedCourseForApply.start_dates
            .filter(dt => dt.startsWith(date))
            .map(dt => dt.split('T')[1].substring(0, 5));

        times.forEach(t => {
            const end = addHours(t, selectedCourseForApply.week_length);
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = `${t} – ${end}`;
            timeSelect.appendChild(opt);
        });
    }

    const weeks = selectedCourseForApply.total_length;
    const start = new Date(date);
    const end = new Date(start);
    end.setDate(start.getDate() + weeks * 7);
    document.getElementById('durationInfo').value = `${weeks} недель (окончание: ${end.toLocaleDateString('ru-RU')})`;

    calculateCourseCost();
}

function addHours(time, hours) {
    const [h, m] = time.split(':').map(Number);
    return `${(h + hours).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

let groupEnrollment = false; //групповая заявка (флаг для студентов)
let earlyReg = false; //рання регистрация (больше чем за месяц)

// Расчёт стоимости
function calculateCourseCost() {
    const students = parseInt(document.getElementById('studentsCount').value) || 1;
    const time = document.getElementById('timeSelect').value;
    if (!time) return document.getElementById('totalCost').value = '0 руб';

    let base = selectedCourseForApply.course_fee_per_hour * selectedCourseForApply.total_length * selectedCourseForApply.week_length;

    // Weekend
    const day = new Date(document.getElementById('startDateSelect').value).getDay();
    if (day === 0 || day === 6) base *= 1.5;

    // Morning/evening
    const hour = parseInt(time.split(':')[0]);
    base += ((hour >= 9 && hour < 12) ? 400 : 0) * students;
    base += ((hour >= 18 && hour < 20) ? 1000 : 0) * students;

    // * students
    base *= students;

    // Опции
    if (document.getElementById('supplementary').checked) base += 2000 * students;
    if (document.getElementById('personalized').checked) base += 1500 * selectedCourseForApply.total_length;
    if (document.getElementById('excursions').checked) base *= 1.25;
    if (document.getElementById('assessment').checked) base += 300;
    if (document.getElementById('interactive').checked) base *= 1.5;
    if (document.getElementById('intensiveCourse').checked) base *= 1.2;


    //АВТОМАТИЧЕСКИЕ СКИДКИ
    const startDate = new Date(document.getElementById('startDateSelect').value);
    const today = new Date();
    
    // Сброс времени для точного сравнения дат
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
    
    if (selectedCourseForApply.week_length >= 5) base *= 1.2;

    document.getElementById('totalCost').value = Math.round(base) + ' руб';
}

// Отправка
async function submitCourseApply() {
    calculateCourseCost();
    const data = {
        course_id: selectedCourseForApply.id,
        tutor_id: 0,
        date_start: document.getElementById('startDateSelect').value,
        time_start: document.getElementById('timeSelect').value,
        duration: selectedCourseForApply.total_length * selectedCourseForApply.week_length,
        persons: parseInt(document.getElementById('studentsCount').value),
        price: parseInt(document.getElementById('totalCost').value.replace(' руб', '')),
        supplementary: document.getElementById('supplementary').checked,
        personalized: document.getElementById('personalized').checked,
        excursions: document.getElementById('excursions').checked,
        assessment: document.getElementById('assessment').checked,
        interactive: document.getElementById('interactive').checked,
        intensive_course: document.getElementById('intensiveCourse').checked,
        group_enrollment: groupEnrollment,
        early_registration: earlyReg
    };

    try {
        const res = await fetch(`${API_BASE}/orders?api_key=${API_KEY}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            alert("❌❌❌Ошибка! Студентов должно быть не более 20!❌❌❌");
            throw new Error('Ошибка');
        };
        console.log('Заявка отправлена!');
        closeCourseModal();
        alert("✔️✔️✔️ Заявка успешно отправлена ✔️✔️✔️");
    } catch (e) {
        console.error(e);
    }
}

// Закрытие
function closeCourseModal() {
    const overlay = document.querySelector('.custom-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
    selectedCourseForApply = null;
}