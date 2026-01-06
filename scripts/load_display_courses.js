document.addEventListener('DOMContentLoaded', () =>{
    // Function to load and display courses
    const API_KEY = '93f2f89f-4f0d-4dda-ba66-ae4884769bb4';
    const API_URL_COURSES = `http://exam-api-courses.std-900.ist.mospolytech.ru/api/courses?api_key=${API_KEY}`; //get_courses
    
    let courses_data = [];
    const per_page = 5;

    async function loaded_courses() {
        try {
            const response = await fetch(API_URL_COURSES);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            courses_data = await response.json();
            DisplayCourses(1);
        }
        catch (error) {
            console.error('Error fetching courses data:', error);
        }
    };

    function paginate(data, page) {
        const start = (page - 1) * per_page;
        return data.slice(start, start + per_page);
    };

    function DisplayCourses(page = 1) {
        const tbody = document.querySelector('#coursesTable tbody');
        tbody.innerHTML = '';

        const paginatedCourses = paginate(courses_data, page);
        paginatedCourses.forEach(course => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${course.id}</td>
                <td>${course.name}</td>
                <td>${course.level}</td>
                <td>${course.description}</td>
                <td>${course.teacher}</td>
                <td>${course.course_fee_per_hour} руб/ч.</td>
                <td><button class="btn btn-primary btn-sm apply-btn" data-id="${course.id}">Подать заявку</button></td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const courseId = btn.dataset.id;
                console.log(`Заявка на курс ID: ${courseId}`);
            });
        });

        render_pagination(Math.ceil(courses_data.length / per_page), page);
    }

    function render_pagination(totalPages, currentPage) {
        const paginationDiv = document.getElementById('coursesPagination');
        paginationDiv.innerHTML = '';

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
            a.addEventListener('click', (e) => {
                e.preventDefault();
                DisplayCourses(i);
            });
            li.appendChild(a);
            ul.appendChild(li);
        };
        paginationDiv.appendChild(ul);
    };

    loaded_courses();
})