document.addEventListener('DOMContentLoaded', () => {
    const cardForm = document.getElementById('card-form');
    const cardOutput = document.getElementById('card-output');
    const outputName = document.getElementById('output-name');
    const outputText = document.getElementById('output-text');
    const downloadButton = document.getElementById('download-button');
    const fontSelect = document.getElementById('font-select');
    const backgroundSelection = document.getElementById('background-selection');
    
    let selectedBackground = ''; // Переменная для хранения URL выбранного фона

    // Список фонов (пути относительные для GitHub Pages)
    const backgroundImages = [
        { id: 'bg1', url: 'backgrounds/bg1.jpg' }, 
        { id: 'bg2', url: 'backgrounds/bg2.png' }, 
        { id: 'bg3', url: 'backgrounds/bg3.jpg' },
        { id: 'bg4', url: 'backgrounds/bg4.jpg' } 
        // Если вы добавили новые фоны, перечислите их здесь!
    ];
    
    // =======================================================
    // ЛОГИКА ВЫБОРА ФОНА
    // =======================================================

    /**
     * Создает визуальные миниатюры для выбора фона и устанавливает обработчики
     */
    function setupBackgroundSelection() {
        if (backgroundImages.length === 0) {
            console.warn("Нет доступных фоновых изображений.");
            return;
        }

        backgroundImages.forEach((bg, index) => {
            const div = document.createElement('div');
            div.className = 'bg-option';
            div.dataset.bgUrl = bg.url; // Используем URL как ID
            div.style.backgroundImage = `url(${bg.url})`;
            
            // Устанавливаем первый фон как выбранный по умолчанию
            if (index === 0) {
                div.classList.add('selected');
                selectedBackground = bg.url;
                cardOutput.style.backgroundImage = `url(${bg.url})`;
            }
            
            div.addEventListener('click', () => {
                // Снимаем выделение со всех
                document.querySelectorAll('.bg-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                // Выделяем выбранный
                div.classList.add('selected');
                selectedBackground = bg.url;
                // Применяем фон к превью
                cardOutput.style.backgroundImage = `url(${bg.url})`;
            });
            backgroundSelection.appendChild(div);
        });
    }

    // =======================================================
    // ЛОГИКА ВЫБОРА ШРИФТА
    // =======================================================
    fontSelect.addEventListener('change', () => {
        const selectedOption = fontSelect.options[fontSelect.selectedIndex];
        // Читаем CSS-значение из data-атрибута
        const fontCss = selectedOption.dataset.fontCss;
        // Применяем выбранный шрифт к элементу открытки
        cardOutput.style.fontFamily = fontCss;
    });

    // =======================================================
    // ГЛАВНЫЙ ОБРАБОТЧИК ФОРМЫ
    // =======================================================
    cardForm.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const recipientName = document.getElementById('recipient-name').value;
        const gratitudeText = document.getElementById('gratitude-text').value;

        // Обновляем текст открытки
        outputName.textContent = recipientName.trim() || 'Имя получателя';
        outputText.textContent = gratitudeText.trim() || 'Текст благодарности';
        
        // Фон уже установлен через setupBackgroundSelection или клик
        downloadButton.style.display = 'block';
    });

    // =======================================================
    // ЛОГИКА СКАЧИВАНИЯ (ИСПРАВЛЕНИЕ РАМКИ/ТЕНИ)
    // =======================================================
    downloadButton.addEventListener('click', () => {
        downloadButton.style.display = 'none'; 
        
        // ИСПРАВЛЕНИЕ: Временно удаляем рамку и тень для чистого скриншота
        cardOutput.classList.add('no-border-shadow');
        
        html2canvas(cardOutput, {
            scale: 2, // Увеличенный масштаб для лучшего качества
            allowTaint: true, 
            useCORS: true, 
            logging: false,
            // Убеждаемся, что html2canvas не добавляет лишний фон
            backgroundColor: null 
        }).then(canvas => {
            
            // ИСПРАВЛЕНИЕ: Возвращаем рамку и тень сразу после создания canvas
            cardOutput.classList.remove('no-border-shadow'); 
            
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
            // Возвращаем класс, даже если произошла ошибка
            cardOutput.classList.remove('no-border-shadow'); 
            downloadButton.style.display = 'block';
        });
    });

    // Инициализация при загрузке страницы
    setupBackgroundSelection();
    // Применяем шрифт по умолчанию
    cardOutput.style.fontFamily = fontSelect.options[fontSelect.selectedIndex].dataset.fontCss;
    downloadButton.style.display = 'none';
});
