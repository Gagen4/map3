/**
 * Инициализирует карту Leaflet и глобальное состояние.
 * @module mapInit
 */

/**
 * Глобальное состояние приложения карты.
 * @typedef {Object} MapState
 * @property {L.Map|null} map - Экземпляр карты Leaflet.
 * @property {L.FeatureGroup} drawnItems - Группа для нарисованных объектов.
 * @property {string|null} currentTool - Активный инструмент (marker, line, polygon, delete).
 * @property {L.Layer|null} selectedLayer - Текущий выбранный слой.
 * @property {L.Marker|null} searchMarker - Маркер для результатов поиска.
 * @property {L.Layer|null} tempLayer - Временный слой для рисования.
 * @property {L.LatLng[]} tempPoints - Точки для временных линий/полигонов.
 */

/** @type {MapState} */
const state = {
    map: null,
    drawnItems: null,
    currentTool: null,
    selectedLayer: null,
    searchMarker: null,
    tempLayer: null,
    tempPoints: [],
  };
  
  /**
   * Инициализирует карту Leaflet с ретраями.
   * @param {number} [retries=3] - Количество попыток.
   * @param {number} [delay=500] - Задержка между попытками в мс.
   * @returns {Promise<void>}
   */
  async function initMap(retries = 3, delay = 500) {
    let attempt = 1;
  
    while (attempt <= retries) {
      try {
        console.log(`Попытка инициализации карты (Попытка ${attempt}/${retries})`);
  
        // Проверка доступности Leaflet
        if (typeof L === 'undefined') {
          throw new Error('Leaflet не загружен. Проверьте подключение скрипта Leaflet.');
        }
  
        // Проверка наличия контейнера карты
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
          throw new Error('Контейнер карты (#map) не найден в DOM');
        }
  
        // Проверка размеров контейнера
        const rect = mapContainer.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.warn('Контейнер карты имеет нулевые размеры. Попытка исправить.');
          mapContainer.style.width = '100vw';
          mapContainer.style.height = '100vh';
        }
  
        // Инициализация карты
        state.map = L.map('map', {
          center: [51.505, -0.09],
          zoom: 13,
          zoomControl: true,
        });
  
        // Добавление слоя тайлов OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(state.map);
  
        // Инициализация слоя нарисованных объектов
        state.drawnItems = new L.FeatureGroup();
        state.map.addLayer(state.drawnItems);
  
        // Принудительное обновление карты
        console.log('Карта инициализирована, выполняется принудительное обновление...');
        setTimeout(() => {
          if (state.map) {
            state.map.invalidateSize();
            console.log('Обновление карты выполнено');
          }
        }, 100);
  
        // Успех
        console.log('Карта успешно инициализирована');
        return;
      } catch (error) {
        console.error(`Ошибка инициализации карты (Попытка ${attempt}/${retries}):`, error);
        if (attempt === retries) {
          console.error('Все попытки инициализации провалились. Карта не будет отображена.');
          alert('Не удалось инициализировать карту после нескольких попыток. Проверьте консоль.');
          // Запасной вариант: базовая карта
          try {
            if (typeof L !== 'undefined' && document.getElementById('map')) {
              state.map = L.map('map').setView([51.505, -0.09], 13);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(state.map);
              console.log('Создана запасная карта');
            }
          } catch (fallbackError) {
            console.error('Ошибка создания запасной карты:', fallbackError);
          }
          return;
        }
        // Ожидание перед следующей попыткой
        await new Promise((resolve) => setTimeout(resolve, delay));
        attempt++;
      }
    }
  }
  
  export { state, initMap };