document.addEventListener('DOMContentLoaded', () => {
    console.log('Profile page loaded');
    
    const API_URL = 'http://exam-api-courses.std-900.ist.mospolytech.ru/api';
    const API_KEY = '93f2f89f-4f0d-4dda-ba66-ae4884769bb4';
    
    let ordersData = [];
    const perPage = 5;
    let selectedOrder = null;
    
    // Alert function (same)
    function showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert', `alert-${type}`, 'mt-2');
        alertDiv.textContent = message;
        document.getElementById('alertsBlock').appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
    }
    
    // Fetch orders
    async function fetchOrders() {
        try {
            const response = await fetch(`${API_URL}/orders?api_key=${API_KEY}`);
            if (!response.ok) throw new Error('Ошибка API');
            ordersData = await response.json();
            if (ordersData.length === 0) {
                document.getElementById('mycourses').style.display = 'none';
                document.getElementById('emptyRequests').style.display = 'block';
            } else {
                document.getElementById('mycourses').style.display = 'block';
                document.getElementById('emptyRequests').style.display = 'none';
                renderOrders(1);
            }
        } catch (error) {
            showAlert('Ошибка загрузки заявок: ' + error.message, 'danger');
        }
    }
    
    // Paginate (same)
    function paginate(data, page) {
        const start = (page - 1) * perPage;
        return data.slice(start, start + perPage);
    }
    
    // Render orders
    function renderOrders(page) {
        const tbody = document.querySelector('#ordersTable tbody');
        tbody.innerHTML = '';
        const paginated = paginate(ordersData, page);
        paginated.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${order.id}</td>
                <td>${order.course_id ? 'Курс ' + order.course_id : 'Репетитор ' + order.tutor_id}</td>
                <td>${order.date_start}</td>
                <td>${order.price}</td>
                <td>
                    <div class="action_buttons">
                        <i class="bi bi-info-circle view-btn" data-id="${order.id}" title="Подробнее"></i>
                        <i class="bi bi-pencil edit-btn" data-id="${order.id}" title="Редактировать"></i>
                        <i class="bi bi-trash3 delete-btn" data-id="${order.id}" title="Удалить"></i>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPagination(Math.ceil(ordersData.length / perPage), page, 'ordersPagination', renderOrders);
        
        // Events
        document.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', openViewModal));
        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', openEditModal));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', openDeleteModal));
    }
    
    // Render pagination (same as main.js)
    function renderPagination(totalPages, currentPage, containerId, renderFunc) {
        // Copy from main.js
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
    
    // View modal
    async function openViewModal(e) {
        selectedOrder = ordersData.find(o => o.id == e.target.dataset.id);
        const body = document.getElementById('viewBody');
        body.innerHTML = `
            <p>ID: ${selectedOrder.id}</p>
            <p>Курс/Репетитор: ${selectedOrder.course_id || selectedOrder.tutor_id}</p>
            <p>Дата: ${selectedOrder.date_start} ${selectedOrder.time_start}</p>
            <p>Продолжительность: ${selectedOrder.duration} ч</p>
            <p>Студенты: ${selectedOrder.persons}</p>
            <p>Стоимость: ${selectedOrder.price} руб</p>
            <p>Опции: ${Object.keys(selectedOrder).filter(k => k.endsWith('_') && selectedOrder[k]).join(', ')}</p>
        `;
        new bootstrap.Modal(document.getElementById('viewModal')).show();
    }
    
    // Edit modal
    function openEditModal(e) {
        selectedOrder = ordersData.find(o => o.id == e.target.dataset.id);
        // Заполни поля editForm аналогично apply, но с данными order
        document.getElementById('editCourseName').value = selectedOrder.course_id ? 'Курс' : 'Репетитор';
        // ... (заполни все)
        // Calc cost on change (copy calculateCost, adapt for edit)
        new bootstrap.Modal(document.getElementById('editModal')).show();
    }
    
    // Submit edit
    document.getElementById('submitEdit').addEventListener('click', async () => {
        const data = {
            // Собери как в submitApply
        };
        try {
            const response = await fetch(`${API_URL}/orders/${selectedOrder.id}?api_key=${API_KEY}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Ошибка редактирования');
            showAlert('Заявка обновлена!');
            bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
            fetchOrders(); // Refresh
        } catch (error) {
            showAlert('Ошибка: ' + error.message, 'danger');
        }
    });
    
    // Delete modal
    function openDeleteModal(e) {
        selectedOrder = ordersData.find(o => o.id == e.target.dataset.id);
        new bootstrap.Modal(document.getElementById('deleteModal')).show();
    }
    
    // Confirm delete
    document.getElementById('confirmDelete').addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_URL}/orders/${selectedOrder.id}?api_key=${API_KEY}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Ошибка удаления');
            showAlert('Заявка удалена!');
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            fetchOrders();
        } catch (error) {
            showAlert('Ошибка: ' + error.message, 'danger');
        }
    });
    
    // Запуск
    fetchOrders();
});