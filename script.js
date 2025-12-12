document.addEventListener('DOMContentLoaded', () => {
    const cardForm = document.getElementById('card-form');
    const cardOutput = document.getElementById('card-output');
    const cardTextContent = cardOutput.querySelector('.card-text-content'); 
    const outputName = document.getElementById('output-name');
    const outputText = document.getElementById('output-text');
    const downloadButton = document.getElementById('download-button');
    const fontSelect = document.getElementById('font-select');
    const backgroundSelection = document.getElementById('background-selection');
    const colorPicker = document.getElementById('color-picker'); 
    
    let selectedBackground = ''; 

    // Константы для размеров
    const PREVIEW_SIZE = 400; // Размер открытки в превью (CSS)
    const FINAL_SIZE = 2000;  // Целевой размер открытки при скачивании (2000x2000)
    const SCALE_FACTOR = FINAL_SIZE / PREVIEW_SIZE; // Коэффициент масштабирования (2000/400 = 5)

    const backgroundImages = [
        { id: 'bg1', url: 'backgrounds/bg1.jpg' }, 
        { id: 'bg2', url: 'backgrounds/bg2.png' }, 
        { id: 'bg3', url: 'backgrounds/bg3.jpg' },
        { id: 'bg4', url: 'backgrounds/bg4.jpg' } 
    ];
    
    const textElements = [outputName, outputText];

    // =======================================================
    // ЛОГИКА ВЫБОРА ЦВЕТА
    // =======================================================
    colorPicker.addEventListener('input', () => {
        const selectedColor = colorPicker.value;
        textElements.forEach(el => {
            el.style.color = selectedColor;
        });
    });

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
    // ЛОГИКА СКАЧИВАНИЯ (ВЫСОКОЕ КАЧЕСТВО ФОНА)
    // =======================================================
    downloadButton.addEventListener('click', () => {
        downloadButton.style.display = 'none'; 
        
        // Сохраняем оригинальные стили
        const originalWidth = cardOutput.style.width;
        const originalHeight = cardOutput.style.height;
        const originalPadding = cardOutput.style.padding;

        // 1. ИСПРАВЛЕНИЕ: Временно устанавливаем большой физический размер элемента
        // Это заставит html2canvas захватить фоновое изображение в высоком разрешении.
        cardOutput.style.width = `${FINAL_SIZE}px`;
        cardOutput.style.height = `${FINAL_SIZE}px`;
        cardOutput.style.padding = `${FINAL_SIZE * 0.05}px`; // Пропорциональный padding

        // УДАЛЯЕМ рамку и тень ПЕРЕД захватом
        cardOutput.classList.remove('add-border-shadow');
        
        html2canvas(cardOutput, {
            // Масштаб 1, так как мы уже увеличили физический размер элемента
            scale: 1, 
            allowTaint: true, 
            useCORS: true, 
            logging: false,
            backgroundColor: null 
        }).then(canvas => {
            
            // 2. ВОЗВРАЩАЕМ оригинальные стили
            cardOutput.style.width = originalWidth;
            cardOutput.style.height = originalHeight;
            cardOutput.style.padding = originalPadding;
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
            // Возвращаем оригинальные стили, даже если ошибка
            cardOutput.style.width = originalWidth;
            cardOutput.style.height = originalHeight;
            cardOutput.style.padding = originalPadding;
            cardOutput.classList.add('add-border-shadow'); 
            downloadButton.style.display = 'block';
        });
    });

    // Инициализация при загрузке страницы
    setupBackgroundSelection();
    
    // Применяем стили по умолчанию
    cardOutput.classList.add('add-border-shadow'); 
    cardTextContent.style.fontFamily = fontSelect.value;
    
    // Применяем цвет по умолчанию из колорпикера
    textElements.forEach(el => {
        el.style.color = colorPicker.value;
    });
    
    downloadButton.style.display = 'none';
});
