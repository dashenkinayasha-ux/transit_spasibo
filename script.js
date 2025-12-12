document.addEventListener('DOMContentLoaded', () => {
    const cardForm = document.getElementById('card-form');
    const cardOutput = document.getElementById('card-output');
    const outputName = document.getElementById('output-name');
    const outputText = document.getElementById('output-text');
    const downloadButton = document.getElementById('download-button');
    const fontSelect = document.getElementById('font-select');
    const colorSelect = document.getElementById('color-select'); // П. 2
    const backgroundSelection = document.getElementById('background-selection');
    
    let selectedBackground = ''; 

    // Список фонов (пути относительные для GitHub Pages)
    const backgroundImages = [
        { id: 'bg1', url: 'backgrounds/bg1.png' }, 
        { id: 'bg2', url: 'backgrounds/bg2.png' }, 
        { id: 'bg3', url: 'backgrounds/bg3.png' }
        // Если вы добавили новые фоны, перечислите их здесь!
    ];
    
    // Элементы, которым нужно менять цвет
    const textElements = [outputName, outputText];

    // =======================================================
    // ЛОГИКА ВЫБОРА ФОНА (П. 4)
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
    // ЛОГИКА ВЫБОРА ШРИФТА (П. 3)
    // =======================================================
    fontSelect.addEventListener('change', () => {
        const fontCss = fontSelect.value;
        // Применяем выбранный шрифт к элементу открытки (меняет оба текста)
        cardOutput.style.fontFamily = fontCss;
    });

    // =======================================================
    // ЛОГИКА ВЫБОРА ЦВЕТА (П. 2)
    // =======================================================
    colorSelect.addEventListener('change', () => {
        const selectedColor = colorSelect.value;
        textElements.forEach(el => {
            el.style.color = selectedColor;
            // Обновляем тень, если выбран светлый цвет, чтобы обеспечить контраст
            if (selectedColor === '#ffffff') {
                el.style.textShadow = '1px 1px 4px rgba(0, 0, 0, 0.8)'; // Темная тень для светлого текста
            } else {
                el.style.textShadow = '1px 1px 4px rgba(255, 255, 255, 1)'; // Светлая тень для темного текста
            }
        });
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
    // ЛОГИКА СКАЧИВАНИЯ (ИСПРАВЛЕНИЕ РАМКИ П. 1)
    // =======================================================
    downloadButton.addEventListener('click', () => {
        downloadButton.style.display = 'none'; 
        
        // 1. ИСПРАВЛЕНИЕ: Временно удаляем рамку и тень для чистого скриншота
        cardOutput.classList.remove('add-border-shadow');
        
        html2canvas(cardOutput, {
            scale: 2, 
            allowTaint: true, 
            useCORS: true, 
            logging: false,
            backgroundColor: null 
        }).then(canvas => {
            
            // 1. ИСПРАВЛЕНИЕ: Возвращаем рамку и тень в превью
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
    
    // Применяем стили по умолчанию
    cardOutput.classList.add('add-border-shadow'); // Добавляем рамку в превью
    cardOutput.style.fontFamily = fontSelect.value;
    textElements.forEach(el => {
        el.style.color = colorSelect.value;
    });
    
    downloadButton.style.display = 'none';
});
