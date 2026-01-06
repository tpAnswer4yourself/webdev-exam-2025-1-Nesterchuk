document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = '93f2f89f-4f0d-4dda-ba66-ae4884769bb4';
    const API_URL_ORDERS = `http://exam-api-courses.std-900.ist.mospolytech.ru/api/orders?api_key=${API_KEY}`; //get_offers'

    let orders_data = [];
    const per_page = 5;

    async function load_orders() {
        try {
            const response = await fetch(API_URL_ORDERS);
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            orders_data = await response.json();
            console.log('Orders data loaded');
            checkOrders();

        }
        catch (error) {
            console.error('Error fetching orders data:', error);
        }
    };

    function checkOrders() {
        const MyCourses = document.getElementById('mycourses');
        const EmptyRequests = document.getElementById('emptyrequests');

        if (orders_data.length === 0) {
            console.log('Заявок нет, пустой контейнер');
            MyCourses.style.display = 'none';
            EmptyRequests.style.display = 'block';
        }
        else {
            console.log('Заявки есть, отображаем таблицу');
            MyCourses.style.display = 'block';
            EmptyRequests.style.display = 'none';
            DisplayOrders(1);
        };
    }

    function DisplayOrders(page = 1) {
        const tbody = document.querySelector('#ordersTable tbody');
        tbody.innerHTML = '';

        const paginatedOrders = paginate(orders_data, page);
        paginatedOrders.array.forEach(element => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${element.id}</td>
                <td>${element.date_start}</td>
                <td>${element.time_start}</td>
                <td>${element.duration}</td>
                <td>${element.price}</td>
                <td><button class="btn btn-success btn-sm apply-btn" data-id="${element.id}">Записаться</button></td>
            `;
            tbody.appendChild(tr);
        });

        //document.querySelectorAll

        render_pagination(Math.ceil(orders_data.length / per_page), page);
    }

    function render_pagination(totalPages, currentPage) {
        const paginationDiv = document.getElementById('ordersPagination');
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
                DisplayOrders(i);
            });
            li.appendChild(a);
            ul.appendChild(li);
        };
        paginationDiv.appendChild(ul);
    };

    load_orders();
});