document.addEventListener('DOMContentLoaded', () => {
    // РЕК. 7: Проверка CDN
    if (typeof html2canvas === 'undefined') {
        const previewSection = document.getElementById('card-preview');
        previewSection.innerHTML = '<h2>Ошибка загрузки</h2><p>Не удалось загрузить библиотеку для генерации открытки. Попробуйте обновить страницу.</p>';
        console.error('html2canvas не загружен!');
        return; // Останавливаем выполнение скрипта
    }

    const cardForm = document.getElementById('card-form');
    const cardOutput = document.getElementById('card-output');
    const cardTextContent = cardOutput.querySelector('.card-text-content'); 
    const outputName = document.getElementById('output-name');
    const outputText = document.getElementById('output-text');
    const downloadButton = document.getElementById('download-button');
    const fontSelect = document.getElementById('font-select');
    const backgroundSelection = document.getElementById('background-selection');
    const colorPicker = document.getElementById('color-picker'); 
    const gratitudeTextarea = document.getElementById('gratitude-text'); 
    const charCount = document.getElementById('char-count'); 
    const resetButton = document.getElementById('reset-form'); 
    
    let selectedBackground = ''; 

    // Константы для размеров
    const FINAL_SIZE = 2000;  // Целевой размер открытки (для 17x17 см)

    // БАЗОВЫЕ РАЗМЕРЫ ШРИФТА (из CSS)
    const FONT_SIZE_NAME = 24;
    const FONT_SIZE_TEXT = 20;

    const backgroundImages = [
        { id: 'bg1', url: 'backgrounds/bg1.jpg' }, 
        { id: 'bg2', url: 'backgrounds/bg2.png' }, 
        { id: 'bg3', url: 'backgrounds/bg3.jpg' },
        { id: 'bg4', url: 'backgrounds/bg4.jpg' } 
    ];
    
    const textElements = [outputName, outputText];

    // =======================================================
    // РЕК. 8: Проверка контраста
    // =======================================================
    function checkContrast(hexColor) {
        const rgb = parseInt(hexColor.substring(1), 16);
        const r = (rgb >> 16) & 0xFF;
        const g = (rgb >> 8) & 0xFF;
        const b = rgb & 0xFF;
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
        
        // Порог яркости для предупреждения
        if (brightness > 160) {
            console.warn('Внимание: Выбран светлый цвет шрифта. Убедитесь, что фон достаточно темный для хорошего контраста.');
        }
    }

    colorPicker.addEventListener('input', () => {
        const selectedColor = colorPicker.value;
        textElements.forEach(el => {
            el.style.color = selectedColor;
        });
        checkContrast(selectedColor);
    });

    // =======================================================
    // РЕК. 3: Счетчик символов
    // =======================================================
    gratitudeTextarea.addEventListener('input', () => {
        charCount.textContent = `${gratitudeTextarea.value.length}/${gratitudeTextarea.maxLength}`;
    });

    // =======================================================
    // ЛОГИКА ВЫБОРА ФОНА (Рек. 1)
    // =======================================================
    function setupBackgroundSelection() {
        // РЕК. 1: Fallback-фоны (если нет изображений, или для старта)
        const allBackgrounds = backgroundImages.length > 0 ? backgroundImages : [
            { id: 'color1', color: '#f0f0f0' }, 
            { id: 'color2', color: '#e6f7ff' },
            { id: 'color3', color: '#ffe6e6' },
            { id: 'color4', color: '#fff5e6' }
        ];

        allBackgrounds.forEach((bg, index) => {
            const div = document.createElement('div');
            div.className = 'bg-option';
            
            if (bg.url) {
                div.dataset.bgUrl = bg.url; 
                div.style.backgroundImage = `url(${bg.url})`;
            } else {
                div.dataset.bgColor = bg.color;
                div.style.backgroundColor = bg.color;
            }
            
            if (index === 0) {
                div.classList.add('selected');
                selectedBackground = bg.url || ('color:' + bg.color);
                if (bg.url) {
                    cardOutput.style.backgroundImage = `url(${bg.url})`;
                    cardOutput.style.backgroundColor = '';
                } else {
                    cardOutput.style.backgroundColor = bg.color;
                    cardOutput.style.backgroundImage = 'none';
                }
            }
            
            div.addEventListener('click', () => {
                document.querySelectorAll('.bg-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                div.classList.add('selected');

                if (div.dataset.bgUrl) {
                    selectedBackground = div.dataset.bgUrl;
                    cardOutput.style.backgroundImage = `url(${div.dataset.bgUrl})`;
                    cardOutput.style.backgroundColor = '';
                } else {
                    selectedBackground = 'color:' + div.dataset.bgColor;
                    cardOutput.style.backgroundImage = 'none';
                    cardOutput.style.backgroundColor = div.dataset.bgColor;
                }
            });
            backgroundSelection.appendChild(div);
        });
    }

    // =======================================================
    // ЛОГИКА ВЫБОРА ШРИФТА
    // =======================================================
    fontSelect.addEventListener('change', () => {
        const fontCss = fontSelect.value;
        cardTextContent.style.fontFamily = fontCss; 
    });

    // =======================================================
    // ГЛАВНЫЙ ОБРАБОТЧИК ФОРМЫ
    // =======================================================
    cardForm.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const recipientName = document.getElementById('recipient-name').value;
        const gratitudeText = document.getElementById('gratitude-text').value;

        outputName.textContent = recipientName.trim() || 'Имя получателя'; 
        outputText.textContent = gratitudeText.trim() || 'Текст благодарности'; 
        
        downloadButton.style.display = 'block';
    });

    // =======================================================
    // РЕК. 5: Сброс формы
    // =======================================================
    resetButton.addEventListener('click', () => {
        cardForm.reset();
        
        outputName.textContent = 'Имя';
        outputText.textContent = 'Текст благодарности';
        downloadButton.style.display = 'none';
        
        // Сброс стилей
        cardTextContent.style.fontFamily = fontSelect.options[0].value;
        colorPicker.value = '#1a1a1a';
        textElements.forEach(el => {
            el.style.color = '#1a1a1a';
        });
        
        // Сброс фона
        const firstOption = document.querySelector('.bg-option');
        if (firstOption) {
            document.querySelectorAll('.bg-option').forEach(opt => opt.classList.remove('selected'));
            firstOption.classList.add('selected');
            firstOption.click(); 
        }
        
        // Сброс счетчика
        charCount.textContent = `0/${gratitudeTextarea.maxLength}`;
    });

    // =======================================================
    // ЛОГИКА СКАЧИВАНИЯ (Рек. 2)
    // =======================================================
    downloadButton.addEventListener('click', () => {
        // РЕК. 2: Индикатор загрузки
        downloadButton.textContent = 'Генерация...';
        downloadButton.disabled = true;
        
        const PREVIEW_SIZE = cardOutput.clientWidth; 
        if (PREVIEW_SIZE === 0) {
            alert('Ошибка: Открытка невидима или имеет нулевой размер.');
            downloadButton.textContent = 'Скачать открытку';
            downloadButton.disabled = false;
            return;
        }
        
        const SCALE_FACTOR = FINAL_SIZE / PREVIEW_SIZE; 
        
        // 1. СОХРАНЯЕМ оригинальные стили
        const originalWidth = cardOutput.style.width;
        const originalHeight = cardOutput.style.height;
        const originalPadding = cardOutput.style.padding;
        const originalNameFontSize = outputName.style.fontSize;
        const originalTextFontSize = outputText.style.fontSize;
        
        const DESKTOP_PADDING_RATIO = 0.05;

        // 2. ВРЕМЕННО УВЕЛИЧИВАЕМ размер элемента (для фона) И шрифт (для текста)
        cardOutput.style.width = `${FINAL_SIZE}px`;
        cardOutput.style.height = `${FINAL_SIZE}px`; 
        cardOutput.style.padding = `${FINAL_SIZE * DESKTOP_PADDING_RATIO}px`; 

        outputName.style.fontSize = `${FONT_SIZE_NAME * SCALE_FACTOR}px`;
        outputText.style.fontSize = `${FONT_SIZE_TEXT * SCALE_FACTOR}px`;

        // УДАЛЯЕМ рамку и тень ПЕРЕД захватом
        cardOutput.classList.remove('add-border-shadow');
        
        html2canvas(cardOutput, {
            scale: 1, 
            allowTaint: true, 
            useCORS: true, 
            logging: false,
            backgroundColor: null 
        }).then(canvas => {
            
            // 3. ВОЗВРАЩАЕМ оригинальные стили
            cardOutput.style.width = originalWidth;
            cardOutput.style.height = originalHeight;
            cardOutput.style.padding = originalPadding;
            outputName.style.fontSize = originalNameFontSize; 
            outputText.style.fontSize = originalTextFontSize;
            cardOutput.classList.add('add-border-shadow'); 
            
            const imageURL = canvas.toDataURL("image/png"); 
            const link = document.createElement('a');
            
            link.href = imageURL;
            const fileName = outputName.textContent.toLowerCase().replace(/\s/g, '_').substring(0, 20);
            link.download = `spasibo_${fileName || 'karta'}_${Date.now()}.png`; 
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // РЕК. 2: Сброс индикатора
            downloadButton.textContent = 'Скачать открытку';
            downloadButton.disabled = false;
        }).catch(err => {
            console.error('Ошибка при генерации изображения:', err);
            // Возвращаем оригинальные стили, даже если ошибка
            cardOutput.style.width = originalWidth;
            cardOutput.style.height = originalHeight;
            cardOutput.style.padding = originalPadding;
            outputName.style.fontSize = originalNameFontSize; 
            outputText.style.fontSize = originalTextFontSize;
            cardOutput.classList.add('add-border-shadow'); 
            
            // РЕК. 2: Сброс индикатора
            downloadButton.textContent = 'Скачать открытку';
            downloadButton.disabled = false;
        });
    });

    // Инициализация при загрузке страницы
    setupBackgroundSelection();
    
    // Применяем стили по умолчанию
    cardOutput.classList.add('add-border-shadow'); 
    cardTextContent.style.fontFamily = fontSelect.value;
    
    // Установка размеров шрифта по умолчанию (для превью)
    outputName.style.fontSize = `${FONT_SIZE_NAME}px`;
    outputText.style.fontSize = `${FONT_SIZE_TEXT}px`;
    
    // Применяем цвет по умолчанию из колорпикера
    textElements.forEach(el => {
        el.style.color = colorPicker.value;
    });
    
    // Инициализация счетчика
    charCount.textContent = `${gratitudeTextarea.value.length}/${gratitudeTextarea.maxLength}`;
    
    downloadButton.style.display = 'none';
});
