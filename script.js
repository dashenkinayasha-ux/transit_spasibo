document.addEventListener('DOMContentLoaded', () => {
    const cardForm = document.getElementById('card-form');
    const cardOutput = document.getElementById('card-output');
    const cardTextContent = cardOutput.querySelector('.card-text-content'); 
    const outputName = document.getElementById('output-name');
    const outputText = document.getElementById('output-text');
    const downloadButton = document.getElementById('download-button');
    const fontSelect = document.getElementById('font-select');
    const backgroundSelection = document.getElementById('background-selection');
    const colorPalette = document.getElementById('color-palette');
    
    let selectedBackground = ''; 
    let selectedColor = '#1a1a1a'; 

    const colors = [
        '#1a1a1a', // Темный
        '#5cb85c', // Зеленый (Accent)
        '#ffffff', // Белый
        '#ff4d4d', // Красный
        '#337ab7', // Синий
        '#f0ad4e', // Желтый
    ];

    const backgroundImages = [
        { id: 'bg1', url: 'backgrounds/bg1.png' }, 
        { id: 'bg2', url: 'backgrounds/bg2.png' }, 
        { id: 'bg3', url: 'backgrounds/bg3.png' } 
    ];
    
    const textElements = [outputName, outputText];

    // =======================================================
    // ЛОГИКА ВЫБОРА ЦВЕТА (ПАЛИТРА) И КОНТРАСТА
    // =======================================================
    function updateTextColor(color) {
        selectedColor = color;
        textElements.forEach(el => {
            el.style.color = color;
            
            // УСИЛЕНИЕ КОНТРАСТА (без оверлея)
            if (color === '#ffffff') {
                // Очень сильная черная тень для белого текста на любом фоне
                el.style.textShadow = '0 0 5px rgba(0, 0, 0, 0.9), 0 0 8px rgba(0, 0, 0, 0.6)'; 
            } else {
                // Сильная белая тень для темного текста на ярком фоне
                el.style.textShadow = '0 0 5px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 255, 255, 0.6)'; 
            }
        });
    }

    function setupColorPalette() {
        colors.forEach((color, index) => {
            const div = document.createElement('div');
            div.className = 'color-option';
            div.style.backgroundColor = color;
            div.dataset.color = color;

            if (index === 0) {
                div.classList.add('selected');
                updateTextColor(color);
            }

            div.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                div.classList.add('selected');
                updateTextColor(color);
            });
            colorPalette.appendChild(div);
        });
    }

    // =======================================================
    // ЛОГИКА ВЫБОРА ФОНА
    // =======================================================
    function setupBackgroundSelection() {
        if (backgroundImages.length === 0) {
            console.warn("Нет доступных фоновых изображений.");
            return;
        }

        backgroundImages.forEach((bg, index) => {
            const div = document.createElement('div');
            div.className = 'bg-option';
            div.dataset.bgUrl = bg.url; 
            div.style.backgroundImage = `url(${bg.url})`;
            
            if (index === 0) {
                div.classList.add('selected');
                selectedBackground = bg.url;
                cardOutput.style.backgroundImage = `url(${bg.url})`;
            }
            
            div.addEventListener('click', () => {
                document.querySelectorAll('.bg-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                div.classList.add('selected');
                selectedBackground = bg.url;
                cardOutput.style.backgroundImage = `url(${bg.url})`;
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
    // ЛОГИКА СКАЧИВАНИЯ (ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ РАМКИ)
    // =======================================================
    downloadButton.addEventListener('click', () => {
        downloadButton.style.display = 'none'; 
        
        // 1. УДАЛЯЕМ рамку и тень ПЕРЕД захватом
        cardOutput.classList.remove('add-border-shadow');
        
        html2canvas(cardOutput, {
            scale: 2, 
            allowTaint: true, 
            useCORS: true, 
            logging: false,
            backgroundColor: null 
        }).then(canvas => {
            
            // 2. ВОЗВРАЩАЕМ рамку и тень СРАЗУ ПОСЛЕ захвата
            cardOutput.classList.add('add-border-shadow'); 
            
            const imageURL = canvas.toDataURL("image/png"); 
            const link = document.createElement('a');
            
            link.href = imageURL;
            const fileName = outputName.textContent.toLowerCase().replace(/\s/g, '_').substring(0, 20);
            link.download = `spasibo_${fileName || 'karta'}_${Date.now()}.png`; 
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            downloadButton.style.display = 'block'; 
        }).catch(err => {
            console.error('Ошибка при генерации изображения:', err);
            alert('Не удалось сгенерировать открытку. Проверьте консоль для деталей.');
            cardOutput.classList.add('add-border-shadow'); 
            downloadButton.style.display = 'block';
        });
    });

    // Инициализация при загрузке страницы
    setupBackgroundSelection();
    setupColorPalette(); 
    
    // Применяем стили по умолчанию
    cardOutput.classList.add('add-border-shadow'); 
    cardTextContent.style.fontFamily = fontSelect.value;
    
    downloadButton.style.display = 'none';
});
