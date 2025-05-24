/**
 * Инициализирует кнопки инструментов и их обработчики событий.
 * @module tools
 */
import { state } from '../front/js/mapInit.js';
import { finishDrawing, resetDrawing, exportToGeoJSON, importFromGeoJSON } from '../front/js/drawing.js';
import { updateToolButtons, showHelp } from '../front/js/ui.js';

/**
 * Инициализирует обработчики событий для кнопок инструментов.
 */
function initTools() {
  // Кэширование элементов кнопок
  const buttons = {
    marker: document.getElementById('add-marker'),
    line: document.getElementById('add-line'),
    polygon: document.getElementById('add-polygon'),
    delete: document.getElementById('delete-object'),
    clear: document.getElementById('clear-all'),
    save: document.getElementById('save-map'),
    load: document.getElementById('load-map'),
  };

  // Добавление маркера
  buttons.marker.addEventListener('click', () => {
    finishDrawing(state);
    resetDrawing(state, false);
    state.currentTool = 'marker';
    updateToolButtons(state);
    showHelp('Кликните на карте, чтобы добавить маркер');
  });

  // Добавление линии
  buttons.line.addEventListener('click', () => {
    finishDrawing(state);
    resetDrawing(state, false);
    state.currentTool = 'line';
    updateToolButtons(state);
    showHelp('Кликните на карте, чтобы добавить точки линии. Нажмите Esc для завершения.');
  });

  // Добавление полигона
  buttons.polygon.addEventListener('click', () => {
    finishDrawing(state);
    resetDrawing(state, false);
    state.currentTool = 'polygon';
    updateToolButtons(state);
    showHelp('Кликните на карте, чтобы добавить точки полигона. Нажмите Esc для завершения.');
  });

  // Удаление объекта
  buttons.delete.addEventListener('click', () => {
    finishDrawing(state);
    if (state.selectedLayer) {
      state.drawnItems.removeLayer(state.selectedLayer);
      state.selectedLayer = null;
    }
    resetDrawing(state, false);
    state.currentTool = 'delete';
    updateToolButtons(state);
    showHelp('Кликните на объект, чтобы удалить его');
  });

  // Очистка всех объектов
  buttons.clear.addEventListener('click', () => {
    state.drawnItems.clearLayers();
    resetDrawing(state, true);
    state.currentTool = null;
    updateToolButtons(state);
    showHelp('Все объекты очищены');
  });

  // Сохранение карты
  buttons.save.addEventListener('click', async () => {
    const fileNameInput = document.getElementById('save-file-name');
    const fileName = fileNameInput.value.trim();
    if (!fileName) {
      showHelp('Введите имя файла для сохранения');
      return;
    }

    const geojson = exportToGeoJSON();
    if (!geojson || geojson.features.length === 0) {
      showHelp('На карте нет объектов для сохранения');
      return;
    }

    try {
      const response = await fetch('http://localhost:5255/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, geojsonData: geojson }),
      });
      if (!response.ok) {
        throw new Error('Ошибка сохранения');
      }
      const result = await response.json();
      showHelp(`Сохранено: ${result.message}`);
      // Обновление списка файлов
      const ui = await import('../front/js/ui.js');
      ui.updateFileList();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      showHelp('Ошибка при сохранении. Проверьте консоль.');
    }
  });

  // Загрузка карты
  buttons.load.addEventListener('click', async () => {
    const fileSelect = document.getElementById('load-file-name');
    const fileName = fileSelect.value;
    if (!fileName) {
      showHelp('Выберите файл для загрузки');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5255/api/load/${fileName}`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки файла');
      }
      const geojson = await response.json();
      importFromGeoJSON(geojson);
      showHelp(`Загружен файл: ${fileName}`);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      showHelp('Ошибка при загрузке. Проверьте консоль.');
    }
  });
}

export { initTools };