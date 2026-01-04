document.addEventListener('DOMContentLoaded', () => {
    console.log('Main page loaded');
    
    const API_URL = 'http://exam-api-courses.std-900.ist.mospolytech.ru/api';
    const API_KEY = '93f2f89f-4f0d-4dda-ba66-ae4884769bb4';
    
    let coursesData = [];
    let tutorsData = [];
    let selectedCourse = null;
    let selectedTutor = null;
    const perPage = 5;
    
    // Функция для уведомлений
    function showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert', `alert-${type}`, 'mt-2');
        alertDiv.textContent = message;
        document.getElementById('alertsBlock').appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
    }
    
    // Fetch курсов
    async function fetchCourses() {
        try {
            const response = await fetch(`${API_URL}/courses?api_key=${API_KEY}`);
            if (!response.ok) throw new Error('Ошибка API');
            coursesData = await response.json();
            renderCourses(1, coursesData);
        } catch (error) {
            showAlert('Ошибка загрузки курсов: ' + error.message, 'danger');
        }
    }
    
    // Fetch репетиторов
    async function fetchTutors() {
        try {
            const response = await fetch(`${API_URL}/tutors?api_key=${API_KEY}`);
            if (!response.ok) throw new Error('Ошибка API');
            tutorsData = await response.json();
            renderTutors(1, tutorsData);
        } catch (error) {
            showAlert('Ошибка загрузки репетиторов: ' + error.message, 'danger');
        }
    }
    
    // Пагинация data
    function paginate(data, page) {
        const start = (page - 1) * perPage;
        return data.slice(start, start + perPage);
    }
    
    // Render курсов
    function renderCourses(page, data = coursesData) {
        const tbody = document.querySelector('#coursesTable tbody');
        tbody.innerHTML = '';
        const paginated = paginate(data, page);
        paginated.forEach(course => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${course.name}</td>
                <td>${course.level}</td>
                <td>${course.total_length}</td>
                <td>${course.course_fee_per_hour}</td>
                <td><button class="btn btn-primary btn-sm apply-btn" data-id="${course.id}">Подать заявку</button></td>
            `;
            tbody.appendChild(tr);
        });
        renderPagination(Math.ceil(data.length / perPage), page, 'coursesPagination', (p) => renderCourses(p, data));
        
        // Event для apply
        document.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedCourse = coursesData.find(c => c.id == btn.dataset.id);
                selectedTutor = null;
                openApplyModal();
            });
        });
    }
    
    // Render репетиторов
    function renderTutors(page, data = tutorsData) {
        const tbody = document.querySelector('#tutorsTable tbody');
        tbody.innerHTML = '';
        const paginated = paginate(data, page);
        paginated.forEach(tutor => {
            const tr = document.createElement('tr');
            tr.dataset.id = tutor.id;
            tr.innerHTML = `
                <td><img src="https://via.placeholder.com/50" alt="Фото" width="50" class="rounded-circle"></td>
                <td>${tutor.name}</td>
                <td>${tutor.language_level}</td>
                <td>${tutor.languages_offered.join(', ')}</td>
                <td>${tutor.work_experience}</td>
                <td>${tutor.price_per_hour}</td>
                <td><button class="btn btn-success btn-sm select-tutor">Выбрать</button></td>
            `;
            tbody.appendChild(tr);
        });
        renderPagination(Math.ceil(data.length / perPage), page, 'tutorsPagination', (p) => renderTutors(p, data));
        
        // Event для выбора
        document.querySelectorAll('.select-tutor').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tr = e.target.closest('tr');
                document.querySelectorAll('#tutorsTable tr').forEach(row => row.classList.remove('table-success'));
                tr.classList.add('table-success');
                selectedTutor = tutorsData.find(t => t.id == tr.dataset.id);
                selectedCourse = null;
                openApplyModal();
            });
        });
    }
    
    // Render пагинации
    function renderPagination(totalPages, currentPage, containerId, renderFunc) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        const ul = document.createElement('ul');
        ul.classList.add('pagination', 'justify-content-center');
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.classList.add('page-item');
            if (i === currentPage) li.classList.add('active');
            const a = document.createElement('a');
            a.classList.add('page-link');
            a.textContent = i;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                renderFunc(i);
            });
            li.appendChild(a);
            ul.appendChild(li);
        }
        container.appendChild(ul);
    }
    
    // Поиск курсов
    document.getElementById('searchCoursesBtn').addEventListener('click', () => {
        const search = document.getElementById('courseSearchInput').value.toLowerCase();
        const level = document.getElementById('courseLevelFilter').value;
        const filtered = coursesData.filter(c => 
            (search ? c.name.toLowerCase().includes(search) : true) &&
            (level ? c.level === level : true)
        );
        renderCourses(1, filtered);
    });
    
    // Поиск репетиторов
    document.getElementById('searchTutorsBtn').addEventListener('click', () => {
        const lang = document.getElementById('tutorLanguageFilter').value;
        const exp = parseInt(document.getElementById('tutorExperienceFilter').value) || 0;
        const filtered = tutorsData.filter(t => 
            (lang ? t.languages_offered.includes(lang) : true) &&
            t.work_experience >= exp
        );
        renderTutors(1, filtered);
    });
    
    // Открытие модалки заявки
    function openApplyModal() {
        if (!selectedCourse && !selectedTutor) {
            showAlert('Выберите курс или репетитора', 'warning');
            return;
        }
        
        const modal = new bootstrap.Modal(document.getElementById('applyModal'));
        const title = document.getElementById('modalTitle');
        title.textContent = 'Оформление заявки';
        
        // Заполнение полей
        document.getElementById('courseName').value = selectedCourse ? selectedCourse.name : selectedTutor.name;
        document.getElementById('tutorName').value = selectedCourse ? selectedCourse.teacher : selectedTutor.name;
        document.getElementById('studentsNum').value = 1;
        document.getElementById('totalCost').value = '0';
        // Сброс чекбоксов
        ['supplementary', 'personalized', 'excursions', 'assessment', 'interactive'].forEach(id => {
            document.getElementById(id).checked = false;
        });
        document.getElementById('autoOptions').innerHTML = '';
        
        // Для курсов: dates from start_dates
        const startDateSelect = document.getElementById('startDate');
        startDateSelect.innerHTML = '';
        if (selectedCourse) {
            const uniqueDates = [...new Set(selectedCourse.start_dates.map(d => new Date(d).toISOString().split('T')[0]))];
            uniqueDates.forEach(date => {
                const option = document.createElement('option');
                option.value = date;
                option.textContent = date;
                startDateSelect.appendChild(option);
            });
            document.getElementById('duration').value = selectedCourse.total_length * selectedCourse.week_length;
            startDateSelect.disabled = false;
            document.getElementById('timeSlot').disabled = true;
        } else {
            // Для репетиторов: input date/time, duration number (1-40)
            startDateSelect.type = 'date';
            startDateSelect.disabled = false;
            document.getElementById('timeSlot').type = 'time';
            document.getElementById('timeSlot').disabled = false;
            document.getElementById('duration').value = '';
            document.getElementById('duration').readOnly = false; // Для репетиторов редактируемый
            document.getElementById('duration').type = 'number';
            document.getElementById('duration').min = 1;
            document.getElementById('duration').max = 40;
        }
        
        // Event для date change (для курсов load times)
        startDateSelect.addEventListener('change', loadTimes);
        
        // Events для calc cost
        document.querySelectorAll('#applyForm input, #applyForm select, #applyForm .form-check-input').forEach(el => {
            el.addEventListener('change', calculateCost);
        });
        
        modal.show();
    }
    
    // Load times for selected date (курсы)
    function loadTimes() {
        const selectedDate = document.getElementById('startDate').value;
        const timeSelect = document.getElementById('timeSlot');
        timeSelect.innerHTML = '';
        timeSelect.disabled = false;
        if (selectedCourse) {
            const times = selectedCourse.start_dates.filter(d => new Date(d).toISOString().split('T')[0] === selectedDate)
                .map(d => new Date(d).toISOString().split('T')[1].slice(0, 5));
            times.forEach(time => {
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time + ' - ' + addHours(time, selectedCourse.week_length);
                timeSelect.appendChild(option);
            });
        }
        calculateCost();
    }
    
    // Add hours to time
    function addHours(time, hours) {
        const [h, m] = time.split(':').map(Number);
        const newH = h + hours;
        return `${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
    
    // Расчёт стоимости
    function calculateCost() {
        if (!selectedCourse && !selectedTutor) return;
        
        const startDateStr = document.getElementById('startDate').value;
        const timeStart = document.getElementById('timeSlot').value;
        const students = parseInt(document.getElementById('studentsNum').value) || 1;
        const durationHours = selectedCourse ? selectedCourse.total_length * selectedCourse.week_length : parseInt(document.getElementById('duration').value) || 0;
        const feePerHour = selectedCourse ? selectedCourse.course_fee_per_hour : selectedTutor.price_per_hour;
        
        if (!startDateStr || !timeStart || durationHours <= 0) {
            document.getElementById('totalCost').value = '0';
            return;
        }
        
        // Base
        let base = feePerHour * durationHours;
        
        // Weekend multiplier
        const startDate = new Date(startDateStr);
        const day = startDate.getDay();
        const isWeekend = day === 0 || day === 6; // Вск/Сб
        const weekendMultiplier = isWeekend ? 1.5 : 1;
        base *= weekendMultiplier;
        
        // Surcharges
        const [hour] = timeStart.split(':').map(Number);
        let morningSurcharge = (hour >= 9 && hour < 12) ? 400 : 0;
        let eveningSurcharge = (hour >= 18 && hour < 20) ? 1000 : 0;
        base += morningSurcharge + eveningSurcharge; // ? per what? Assume per course/session
        
        // * students
        let total = base * students;
        
        // Auto options
        const autoOptionsDiv = document.getElementById('autoOptions');
        autoOptionsDiv.innerHTML = '';
        const currentDate = new Date();
        const oneMonthLater = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
        const early = new Date(startDateStr) > oneMonthLater;
        if (early) {
            total *= 0.9;
            addPlaque('Скидка за раннюю регистрацию: -10%');
        }
        const group = students >= 5;
        if (group) {
            total *= 0.85;
            addPlaque('Скидка за группу: -15%');
        }
        const intensive = selectedCourse ? selectedCourse.week_length >= 5 : false;
        if (intensive) {
            total *= 1.2;
            addPlaque('Надбавка за интенсив: +20%');
        }
        
        // User options
        if (document.getElementById('supplementary').checked) total += 2000 * students;
        if (document.getElementById('personalized').checked) total += 1500 * (selectedCourse ? selectedCourse.total_length : 1); // Assume 1 week for tutors
        if (document.getElementById('excursions').checked) total *= 1.25;
        if (document.getElementById('assessment').checked) total += 300;
        if (document.getElementById('interactive').checked) total *= 1.5;
        
        document.getElementById('totalCost').value = Math.round(total);
        
        function addPlaque(text) {
            const div = document.createElement('div');
            div.classList.add('auto-plaque');
            div.textContent = text;
            autoOptionsDiv.appendChild(div);
        }
    }
    
    // Submit заявки
    document.getElementById('submitApply').addEventListener('click', async () => {
        const data = {
            date_start: document.getElementById('startDate').value,
            time_start: document.getElementById('timeSlot').value,
            persons: parseInt(document.getElementById('studentsNum').value),
            supplementary: document.getElementById('supplementary').checked,
            personalized: document.getElementById('personalized').checked,
            excursions: document.getElementById('excursions').checked,
            assessment: document.getElementById('assessment').checked,
            interactive: document.getElementById('interactive').checked,
        };
        if (selectedCourse) {
            data.course_id = selectedCourse.id;
            data.tutor_id = 0;
        } else {
            data.tutor_id = selectedTutor.id;
            data.course_id = 0;
            data.duration = parseInt(document.getElementById('duration').value);
        }
        
        try {
            const response = await fetch(`${API_URL}/orders?api_key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Ошибка создания');
            showAlert('Заявка создана!');
            bootstrap.Modal.getInstance(document.getElementById('applyModal')).hide();
        } catch (error) {
            showAlert('Ошибка: ' + error.message, 'danger');
        }
    });
    
    // Инит карты
    const map = L.map('map').setView([55.7558, 37.6173], 12); // Москва
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    // Маркеры для баллов (библиотеки)
    L.marker([55.7558, 37.6173]).addTo(map).bindPopup('Центральная библиотека');
    L.marker([55.7600, 37.6200]).addTo(map).bindPopup('Языковое кафе');
    
    // Запуск
    fetchCourses();
    fetchTutors();
    document.getElementById('enrollBtn').addEventListener('click', openApplyModal); // Для репетиторов, если selected
});