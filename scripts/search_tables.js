document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = '93f2f89f-4f0d-4dda-ba66-ae4884769bb4';
    const API_URL_TUTORS = `https://exam-api-courses.std-900.ist.mospolytech.ru/api/tutors?api_key=${API_KEY}`;
    const API_URL_COURSES = `https://exam-api-courses.std-900.ist.mospolytech.ru/api/courses?api_key=${API_KEY}`;

    let tutors_data = [];
    let courses_data = [];

    // РЕПЕТИТОРЫ - ПОИСК И ФИЛЬТРЫ
    const tutorLanguageFilter = document.getElementById('tutorLanguageFilter'); //фильтр языка преподавания
    const tutorExperienceFilter = document.getElementById('tutorExperienceFilter'); //фильтр минимальный опыт
    const searchTutorsBtn = document.getElementById('searchTutorsBtn'); //кнопка поиска репетиторов

    tutorLanguageFilter.addEventListener('change', filter_and_display_Tutors);
    tutorExperienceFilter.addEventListener('input', filter_and_display_Tutors);
    searchTutorsBtn.addEventListener('click', filter_and_display_Tutors);


    

    async function loaded_tutors() {
        try {
            const response = await fetch(API_URL_TUTORS);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            tutors_data = await response.json();
        }
        catch (error) {
            console.error('Error fetching tutors data:', error);
        }
    };

    function filter_and_display_Tutors() {
        const selectedLanguage = tutorLanguageFilter.value.trim();
        const minExperience = parseInt(tutorExperienceFilter.value) || 0;

        const filteredTutors = tutors_data.filter(tutor => {
            const languageMatch = !selectedLanguage || tutor.languages_offered.includes(selectedLanguage);

            const experienceMatch = tutor.work_experience >= minExperience;

            return languageMatch && experienceMatch;
        });

        displayFilteredTutors(filteredTutors);
    }

    function displayFilteredTutors(tutors) {
        const resultsWrapper = document.getElementById('searchTutorsResults');
        const tableContainer = document.getElementById('tutorsTableContainer');
        const emptyTutors = document.getElementById('emptyTutors');
        const tbody = document.querySelector('#searchTutorsTable tbody');
        tbody.innerHTML = '';

        resultsWrapper.style.display = 'block';

        if (tutors.length === 0) {
            tableContainer.style.display = 'none';
            emptyTutors.style.display = 'block';
            return;
        }

        tableContainer.style.display = 'block';
        emptyTutors.style.display = 'none';

        tutors.forEach(tutor => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="../media/tutors_img.png" alt="Фото" class="rounded-circle" style="width: 80px; height: 80px;"></td>
                <td>${tutor.name || 'N/A'}</td>
                <td>${tutor.language_level || 'N/A'}</td>
                <td>${tutor.work_experience || 0}</td>
                <td>${tutor.languages_offered?.join(', ') || 'N/A'}</td>
                <td>${tutor.price_per_hour || 'N/A'}</td>
                <td>
                    <button class="btn btn-success btn-sm select-tutor-btn" data-id="${tutor.id}">
                        Выбрать
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.select-tutor-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const tutorId = event.target.dataset.id;
                console.log(`Выбран репетитор: ${tutorId}`);
            });
        });
    }


    // КУРСЫ - ПОИСК И ФИЛЬТРЫ


    const searchInputCourse = document.getElementById('courseSearchInput');
    const searchLevelFilter = document.getElementById('courseLevelFilter');
    const searchBtnCourse = document.getElementById('searchCoursesBtn');

    searchInputCourse.addEventListener('input', filter_and_display_Courses);
    searchLevelFilter.addEventListener('change', filter_and_display_Courses);
    searchBtnCourse.addEventListener('click', filter_and_display_Courses);


    async function loaded_courses() {
        try {
            const response = await fetch(API_URL_COURSES);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            courses_data = await response.json();
        }
        catch (error) {
            console.error('Error fetching courses data:', error);
        }
    };

    function filter_and_display_Courses() {
        const selectedLevel = searchLevelFilter.value.trim();
        const searchTerm = searchInputCourse.value.trim().toLowerCase();

        const filteredCourses = courses_data.filter(course => {
            const nameMatch = !searchTerm || course.name.toLowerCase().includes(searchTerm);
            const levelMatch = !selectedLevel || course.level === selectedLevel;
            return nameMatch && levelMatch;
        });

        displayFilteredCourses(filteredCourses);
    }

    function displayFilteredCourses(courses) {
        const resultsWrapper = document.getElementById('searchCoursesResults');
        const tableContainer = document.getElementById('coursesTableContainer');
        const emptyCourses = document.getElementById('emptyCourses');
        const tbody = document.querySelector('#searchCoursesTable tbody');

        tbody.innerHTML = '';

        // Показываем весь блок результатов
        resultsWrapper.style.display = 'block';

        if (courses.length === 0) {
            // Прячем таблицу, показываем пустой див
            tableContainer.style.display = 'none';
            emptyCourses.style.display = 'block';
            return;
        }

        tableContainer.style.display = 'block';
        emptyCourses.style.display = 'none';

        courses.forEach(course => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${course.name}</td>
                <td>${course.level}</td>
                <td>${course.description}</td>
                <td>${course.teacher}</td>
                <td>${course.course_fee_per_hour} руб/ч.</td>
                <td><button class="btn btn-primary btn-sm apply-btn select-course-btn" data-id="${course.id}">Подать заявку</button></td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.select-course-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const courseId = event.target.dataset.id;
                console.log(`Выбран курс: ${courseId}`);
            });
        });
    }


    loaded_tutors();
    loaded_courses();
});