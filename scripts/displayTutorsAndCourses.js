document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '93f2f89f-4f0d-4dda-ba66-ae4884769bb4';
    const API_BASE = 'http://exam-api-courses.std-900.ist.mospolytech.ru/api';
    const API_URL_TUTORS = `${API_BASE}/tutors?api_key=${API_KEY}`;
    const API_URL_COURSES = `${API_BASE}/courses?api_key=${API_KEY}`;

    let tutors_data = [];
    window.courses_data = [];
    let selectedTutorId = null;
    const per_page = 5;

    // ── Загрузка данных ──────────────────────────────────────────────────
    async function loadAllData() {
        try {
            const [tutorsRes, coursesRes] = await Promise.all([
                fetch(API_URL_TUTORS),
                fetch(API_URL_COURSES)
            ]);

            tutors_data = await tutorsRes.json();
            courses_data = await coursesRes.json();

            console.log('Загружено репетиторов:', tutors_data.length);
            console.log('Загружено курсов:', courses_data.length);

            // Показываем начальные списки (доступные)
            checkAndDisplayTutors();
            checkAndDisplayCourses();
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        }
    }

    // ── Делегирование событий ─────────────────────────────────
    document.addEventListener('click', (e) => {
        const target = e.target;

        // Репетиторы: "выбор репетитора для оформления заявки"
        if (target.closest('.select-tutor-btn')) {
            const btn = target.closest('.select-tutor-btn');
            const tutorId = btn.dataset.id;

            //если наживаем выбрать
            if (btn.classList.contains('btn-success')) {
                if (selectedTutorId && selectedTutorId !== tutorId) {
                    resetTutorSelection(selectedTutorId);
                }

                // Выбираем нового
                selectedTutorId = tutorId;
                updateTutorSelection(tutorId, true); // true = выбрать

                console.log(`Выбран репетитор: ${tutorId}`);
            }
            // Если нажимаем "Отменить"
            else if (btn.classList.contains('btn-secondary')) {
                resetTutorSelection(tutorId);
                selectedTutorId = null;
                console.log(`Отменён репетитор: ${tutorId}`);
            }
        }

        // Курсы: "Подать заявку"
        if (target.closest('.select-course-btn')) {
            const btn = target.closest('.select-course-btn');
            const courseId = btn.dataset.id;
            console.log(`Выбран курс: ${courseId}`);
            openCourseApplyModal(courseId);
        }

        // Пагинация (для всех таблиц)
        if (target.closest('.page-link')) {
            e.preventDefault();
            const page = parseInt(target.textContent);
            const pagination = target.closest('.pagination');
            if (!pagination) return;

            const id = pagination.id;
            if (id === 'coursesPagination') DisplayCourses(page);
            if (id === 'tutorsPagination') DisplayTutors(page);
        }
    });

    // ── Репетиторы ───────────────────────────────────────────────────────
    const tutorLanguageFilter = document.getElementById('tutorLanguageFilter');
    const tutorExperienceFilter = document.getElementById('tutorExperienceFilter');
    const searchTutorsBtn = document.getElementById('searchTutorsBtn');

    tutorLanguageFilter.addEventListener('change', filter_and_display_Tutors);
    tutorExperienceFilter.addEventListener('input', filter_and_display_Tutors);
    searchTutorsBtn.addEventListener('click', filter_and_display_Tutors);

    function filter_and_display_Tutors() {
        const selectedLanguage = tutorLanguageFilter.value.trim();
        const minExperience = parseInt(tutorExperienceFilter.value) || 0;

        const filtered = tutors_data.filter(t => {
            const langMatch = !selectedLanguage || t.languages_offered.includes(selectedLanguage);
            const expMatch = t.work_experience >= minExperience;
            return langMatch && expMatch;
        });

        displayFilteredTutors(filtered);

        //выделение репетитора, если было
        if (selectedTutorId) {
            updateTutorSelection(selectedTutorId, true);
        }
    }

    function displayFilteredTutors(tutors) {
        const wrapper = document.getElementById('searchTutorsResults');
        const tableCont = document.getElementById('tutorsTableContainer');
        const empty = document.getElementById('emptyTutors');
        const tbody = document.querySelector('#searchTutorsTable tbody');
        tbody.innerHTML = '';

        wrapper.style.display = 'block';

        if (tutors.length === 0) {
            tableCont.style.display = 'none';
            empty.style.display = 'block';
            return;
        }

        tableCont.style.display = 'block';
        empty.style.display = 'none';

        tutors.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="../media/tutors_img.png" alt="Фото" class="rounded-circle" style="width:80px;height:80px;"></td>
                <td>${t.name || 'N/A'}</td>
                <td>${t.language_level || 'N/A'}</td>
                <td>${t.work_experience || 0}</td>
                <td>${t.languages_offered?.join(', ') || 'N/A'}</td>
                <td>${t.price_per_hour || 'N/A'}</td>
                <td><button class="btn btn-success btn-sm select-tutor-btn" data-id="${t.id}">Выбрать</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    function checkAndDisplayTutors() {
        const table = document.getElementById('dostupnie_tutors');
        const empty = document.getElementById('empty_tutors');

        if (tutors_data.length === 0) {
            table.style.display = 'none';
            empty.style.display = 'block';
        } else {
            table.style.display = 'block';
            empty.style.display = 'none';
            DisplayTutors(1);
        }
    }

    function DisplayTutors(page = 1) {
        const tbody = document.querySelector('#tutorsTable tbody');
        tbody.innerHTML = '';

        const paginated = paginate(tutors_data, page);
        paginated.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${t.name}</td>
                <td>${t.work_experience}</td>
                <td>${t.languages_offered?.join(', ') || 'N/A'}</td>
                <td>${t.price_per_hour}</td>
                <td><button class="btn btn-success btn-sm select-tutor-btn" data-id="${t.id}">Выбрать</button></td>
            `;
            tbody.appendChild(tr);
        });

        renderPagination('tutorsPagination', Math.ceil(tutors_data.length / per_page), page, DisplayTutors);
    }

    // ── Курсы ───────────────────────────────────────────────
    const courseSearchInput = document.getElementById('courseSearchInput');
    const courseLevelFilter = document.getElementById('courseLevelFilter');
    const searchCoursesBtn = document.getElementById('searchCoursesBtn');

    searchCoursesBtn.addEventListener('click', filter_and_display_Courses);
    courseSearchInput.addEventListener('input', filter_and_display_Courses);
    courseLevelFilter.addEventListener('change', filter_and_display_Courses);

    function filter_and_display_Courses() {
        const searchTerm = courseSearchInput.value.trim().toLowerCase();
        const selectedLevel = courseLevelFilter.value;

        const filtered = courses_data.filter(c => {
            const nameMatch = !searchTerm || c.name.toLowerCase().includes(searchTerm);
            const levelMatch = !selectedLevel || c.level === selectedLevel;
            return nameMatch && levelMatch;
        });

        displayFilteredCourses(filtered);
    }

    function displayFilteredCourses(courses) {
        const wrapper = document.getElementById('searchCoursesResults');
        const tableCont = document.getElementById('coursesTableContainer');
        const empty = document.getElementById('emptyCourses');
        const tbody = document.querySelector('#searchCoursesTable tbody');
        tbody.innerHTML = '';

        wrapper.style.display = 'block';

        if (courses.length === 0) {
            tableCont.style.display = 'none';
            empty.style.display = 'block';
            return;
        }

        tableCont.style.display = 'block';
        empty.style.display = 'none';

        courses.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.name}</td>
                <td>${c.level}</td>
                <td>${c.description?.substring(0, 80) + '...' || 'N/A'}</td>
                <td>${c.teacher || 'N/A'}</td>
                <td>${c.course_fee_per_hour} руб/ч.</td>
                <td><button class="btn btn-primary btn-sm select-course-btn" data-id="${c.id}">Подать заявку</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    function checkAndDisplayCourses() {
        const table = document.getElementById('dostupnie_kursi');
        const empty = document.getElementById('empty_courses');

        if (courses_data.length === 0) {
            table.style.display = 'none';
            empty.style.display = 'block';
        } else {
            table.style.display = 'block';
            empty.style.display = 'none';
            DisplayCourses(1);
        }
    }

    function DisplayCourses(page = 1) {
        const tbody = document.querySelector('#coursesTable tbody');
        tbody.innerHTML = '';

        const paginated = paginate(courses_data, page);
        paginated.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>${c.level}</td>
                <td>${c.description}</td>
                <td>${c.teacher}</td>
                <td>${c.course_fee_per_hour} руб/ч.</td>
                <td><button class="btn btn-primary btn-sm select-course-btn" data-id="${c.id}">Подать заявку</button></td>
            `;
            tbody.appendChild(tr);
        });

        renderPagination('coursesPagination', Math.ceil(courses_data.length / per_page), page, DisplayCourses);
    }

    // ── Общая пагинация ──────────────────────────────────────────────────
    function renderPagination(paginationId, totalPages, currentPage, displayFunc) {
        const div = document.getElementById(paginationId);
        div.innerHTML = '';

        const ul = document.createElement('ul');
        ul.classList.add('pagination', 'justify-content-center');
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.classList.add('page-item');
            if (i === currentPage) li.classList.add('active');
            const a = document.createElement('a');
            a.classList.add('page-link');
            a.textContent = i;
            a.href = '#';
            a.addEventListener('click', e => {
                e.preventDefault();
                displayFunc(i);
            });
            li.appendChild(a);
            ul.appendChild(li);
        }
        div.appendChild(ul);
    }



    // ── Функции для управления выбором (синхронизация между таблицами) ──
    function updateTutorSelection(tutorId, select = true) {
        // Находим ВСЕ кнопки с этим ID в обеих таблицах
        document.querySelectorAll(`.select-tutor-btn[data-id="${tutorId}"]`).forEach(btn => {
            if (select) {
                btn.textContent = 'Отменить';
                btn.classList.remove('btn-success');
                btn.classList.add('btn-secondary');
            } else {
                btn.textContent = 'Выбрать';
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-success');
            }
        });

        // Подсветка строк
        document.querySelectorAll(`tr:has(.select-tutor-btn[data-id="${tutorId}"])`).forEach(row => {
            if (select) {
                row.classList.add('table-success');
            } else {
                row.classList.remove('table-success');
            }
        });
    }

    function resetTutorSelection(tutorId) {
        updateTutorSelection(tutorId, false);
    }


    // ── Запуск ──
    loadAllData();
});