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
    const FINAL_SIZE = 2000;  // *** ИЗМЕНЕНО: Целевой размер открытки (17x17 см при 300 DPI) ***

    // БАЗОВЫЕ РАЗМЕРЫ ШРИФТА (из CSS)
    const FONT_SIZE_NAME = 24;
    const FONT_SIZE_TEXT = 20;

    const backgroundImages = [
        { id: 'bg1', url: 'backgrounds/bg1.png' }, 
        { id: 'bg2', url: 'backgrounds/bg2.png' }, 
        { id: 'bg3', url: 'backgrounds/bg3.png' }
    ];
    
    const textElements = [outputName, outputText];

    // ... (Логика выбора цвета, фона, шрифта без изменений) ...
    
    colorPicker.addEventListener('input', () => {
        const selectedColor = colorPicker.value;
        textElements.forEach(el => {
            el.style.color = selectedColor;
        });
    });

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

    fontSelect.addEventListener('change', () => {
        const fontCss = fontSelect.value;
        cardTextContent.style.fontFamily = fontCss; 
    });

    cardForm.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const recipientName = document.getElementById('recipient-name').value;
        const gratitudeText = document.getElementById('gratitude-text').value;

        outputName.textContent = recipientName.trim() || 'Имя получателя'; 
        outputText.textContent = gratitudeText.trim() || 'Текст благодарности'; 
        
        downloadButton.style.display = 'block';
    });


    // =======================================================
    // ЛОГИКА СКАЧИВАНИЯ (Исправление динамического размера и масштаба)
    // =======================================================
    downloadButton.addEventListener('click', () => {
        downloadButton.style.display = 'none'; 
        
        // *** ИСПРАВЛЕНИЕ 1: Динамически получаем текущий размер превью ***
        const PREVIEW_SIZE = cardOutput.clientWidth; 
        if (PREVIEW_SIZE === 0) {
            alert('Ошибка: Открытка невидима или имеет нулевой размер.');
            downloadButton.style.display = 'block';
            return;
        }
        
        const SCALE_FACTOR = FINAL_SIZE / PREVIEW_SIZE; 
        
        // 1. СОХРАНЯЕМ оригинальные стили
        const originalWidth = cardOutput.style.width;
        const originalHeight = cardOutput.style.height;
        const originalPadding = cardOutput.style.padding;
        const originalPaddingBottom = cardOutput.style.paddingBottom;
        const originalNameFontSize = outputName.style.fontSize;
        const originalTextFontSize = outputText.style.fontSize;

        // 2. ВРЕМЕННО УВЕЛИЧИВАЕМ размер элемента (для фона) И шрифт (для текста)
        cardOutput.style.width = `${FINAL_SIZE}px`;
        cardOutput.style.height = `${FINAL_SIZE}px`;
        cardOutput.style.padding = `${PREVIEW_SIZE * 0.05 * SCALE_FACTOR}px`; 
        cardOutput.style.paddingBottom = originalPaddingBottom; // Сбрасываем трюк с padding-bottom

        // Увеличение размера шрифта для сохранения масштаба
        outputName.style.fontSize = `${FONT_SIZE_NAME * SCALE_FACTOR}px`;
        outputText.style.fontSize = `${FONT_SIZE_TEXT * SCALE_FACTOR}px`;

        // УДАЛЯЕМ рамку и тень ПЕРЕД захватом
        cardOutput.classList.remove('add-border-shadow');
        
        html2canvas(cardOutput, {
            scale: 1, // Масштаб 1, т.к. мы уже увеличили физические размеры
            allowTaint: true, 
            useCORS: true, 
            logging: false,
            backgroundColor: null 
        }).then(canvas => {
            
            // 3. ВОЗВРАЩАЕМ оригинальные стили
            cardOutput.style.width = originalWidth;
            cardOutput.style.height = originalHeight;
            cardOutput.style.padding = originalPadding;
            cardOutput.style.paddingBottom = originalPaddingBottom;
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
            
            downloadButton.style.display = 'block'; 
        }).catch(err => {
            console.error('Ошибка при генерации изображения:', err);
            // Возвращаем оригинальные стили, даже если ошибка
            cardOutput.style.width = originalWidth;
            cardOutput.style.height = originalHeight;
            cardOutput.style.padding = originalPadding;
            cardOutput.style.paddingBottom = originalPaddingBottom;
            outputName.style.fontSize = originalNameFontSize; 
            outputText.style.fontSize = originalTextFontSize;
            cardOutput.classList.add('add-border-shadow'); 
            downloadButton.style.display = 'block';
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
    
    downloadButton.style.display = 'none';
});
