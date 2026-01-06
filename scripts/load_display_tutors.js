document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '93f2f89f-4f0d-4dda-ba66-ae4884769bb4';
    const API_URL_TUTORS = `http://exam-api-courses.std-900.ist.mospolytech.ru/api/tutors?api_key=${API_KEY}`; //get_tutors

    let tutors_data = [];
    const per_page = 5;

    async function loaded_tutors() {
        try {
            const response = await fetch(API_URL_TUTORS);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            tutors_data = await response.json();
            console.log('Попытка не птыка')
            DisplayTutors(1);
        }
        catch (error) {
            console.error('Error fetching tutors data:', error);
        }
    };


    function paginate(data, page) {
        const start = (page - 1) * per_page;
        return data.slice(start, start + per_page);
    };

    function DisplayTutors(page = 1) {
        const tbody = document.querySelector('#tutorsTable tbody');
        tbody.innerHTML = '';

        const paginatedTutors = paginate(tutors_data, page);
        paginatedTutors.forEach(tutor => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${tutor.name}</td>
                <td>${tutor.work_experience}</td>
                <td>${tutor.languages_spoken}</td>
                <td>${tutor.price_per_hour}</td>
                <td><button class="btn btn-success btn-sm apply-btn" data-id="${tutor.id}">Записаться</button></td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tutor_id = btn.dataset.id;
                console.log(`Заявка на курс ID: ${tutor_id}`);
            });
        });

        render_pagination(Math.ceil(tutors_data.length / per_page), page);
    }

    function render_pagination(totalPages, currentPage) {
        const paginationDiv = document.getElementById('tutorsPagination');
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
                DisplayTutors(i);
            });
            li.appendChild(a);
            ul.appendChild(li);
        };
        paginationDiv.appendChild(ul);
    };

    loaded_tutors();
});
