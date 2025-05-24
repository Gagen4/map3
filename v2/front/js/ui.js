/**
 * Управляет обновлением интерфейса (кнопки, текст подсказок, координаты).
 * @module ui
 */
import { state } from './mapInit.js';


/**
 * Обновляет состояние кнопок инструментов.
 * @param {MapState} state - Глобальное состояние.
 */
function updateToolButtons(state) {
  console.log('Обновление кнопок, currentTool:', state.currentTool);
  document.querySelectorAll('.tools button').forEach((btn) => {
    btn.classList.remove('active');
  });

  if (state.currentTool) {
    const btnId = state.currentTool === 'delete' ? 'delete-object' : `add-${state.currentTool}`;
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.classList.add('active');
    } else {
      console.warn(`Кнопка с ID ${btnId} не найдена`);
    }
  }
}

/**
 * Отображает текст подсказки.
 * @param {string} message - Сообщение для отображения.
 */
function showHelp(message) {
  const help = document.getElementById('help-text');
  if (help) {
    help.textContent = message;
  } else {
    console.warn('Элемент подсказки (#help-text) не найден');
  }
}

/**
 * Инициализирует отображение координат с дебансированием.
 */
function initCoordinates() {
  if (!state.map) {
    console.error('Карта не инициализирована для обновления координат');
    return;
  }

  // Дебансирование обновления координат
  let timeout;
  state.map.on('mousemove', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const lat = document.getElementById('lat');
      const lng = document.getElementById('lng');
      if (lat && lng) {
        lat.textContent = e.latlng.lat.toFixed(6);
        lng.textContent = e.latlng.lng.toFixed(6);
      } else {
        console.warn('Элементы координат (#lat, #lng) не найдены');
      }
    }, 50);
  });
}
async function updateFileList() {
    try {
        const files = await getFiles();
        const select = document.getElementById('load-file-name');
        select.innerHTML = '<option value="">Выберите файл</option>';
        files.forEach(file => {
            const option = document.createElement('option');
            option.value = file;
            option.textContent = file;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка обновления списка:', error);
    }
}



export { updateToolButtons, showHelp, initCoordinates, updateFileList };