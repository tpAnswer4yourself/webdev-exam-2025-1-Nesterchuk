document.addEventListener('DOMContentLoaded', function () {
    if (typeof ymaps === 'undefined') {
        console.error('Yandex Maps API не загружен.');
        return;
    }

    ymaps.ready(init);

    function init() {
        try {
            var myMap = new ymaps.Map('map', {
                center: [55.7558, 37.6173], // центр москвы корды
                zoom: 11,
                controls: ['zoomControl', 'fullscreenControl']
            });

            var searchControl = new ymaps.control.SearchControl({
                options: {
                    provider: 'yandex#search',
                    size: 'medium'
                }
            });

            myMap.controls.add(searchControl);

            const filterSelect = document.getElementById('resourceFilter');
            if (filterSelect) {
                filterSelect.addEventListener('change', function () {
                    const query = this.value.trim();
                    if (query) {
                        searchControl.search(query + ' Москва');
                    } else {
                        searchControl.search('');
                    }
                });

                // по умолчанию - курсы выбраны
                searchControl.search('Курсы иностранного языка Москва');
            }
        } catch (e) {
            console.error('Ошибка инициализации карты Yandex:', e);
        }
    }
});