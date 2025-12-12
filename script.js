document.addEventListener('DOMContentLoaded', () => {
    const cardForm = document.getElementById('card-form');
    const cardOutput = document.getElementById('card-output');
    const outputName = document.getElementById('output-name');
    const outputText = document.getElementById('output-text');
    const downloadButton = document.getElementById('download-button');

    // !!! ВАЖНО: Добавлен слеш в начале пути (/) для корректной работы на GitHub Pages (п. 7) !!!
    const backgroundImages = [
        '/backgrounds/bg1.png', 
        '/backgrounds/bg2.png', 
        '/backgrounds/bg3.png',
        '/backgrounds/bg4.png' 
        // Убедитесь, что все ваши файлы перечислены здесь!
    ];

    /**
     * Выбирает случайный фон из списка
     * @returns {string} URL фонового изображения
     */
    function getRandomBackground() {
        if (backgroundImages.length === 0) {
            console.error("Нет доступных фоновых изображений.");
            return '';
        }
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        return backgroundImages[randomIndex];
    }

    // Обработчик отправки формы (п. 1, 2, 5)
    cardForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Предотвращаем стандартную отправку формы

        const recipientName = document.getElementById('recipient-name').value;
        const gratitudeText = document.getElementById('gratitude-text').value;

        // 1. Обновляем текст открытки (п. 1, 2)
        // Используем 'trim()' для удаления лишних пробелов, 
        // и заменяем текст по умолчанию на введенные данные.
        outputName.textContent = recipientName.trim() || 'Имя получателя';
        outputText.textContent = gratitudeText.trim() || 'Текст благодарности';
        
        // 2. Устанавливаем случайный фон
        const randomBg = getRandomBackground();
        cardOutput.style.backgroundImage = `url(${randomBg})`;

        // 3. Показываем кнопку скачивания
        downloadButton.style.display = 'block';
    });

    // Обработчик кнопки скачивания
    downloadButton.addEventListener('click', () => {
        downloadButton.style.display = 'none'; // Скрываем кнопку перед скриншотом
        
        // Генерируем изображение из HTML элемента
        html2canvas(cardOutput, {
            scale: 2, 
            allowTaint: true, // Разрешаем использование изображений (важно для фонов)
            useCORS: true, // Используем CORS для загрузки фонов, если они с другого домена (хотя на GP не обязательно)
            logging: false
        }).then(canvas => {
            const imageURL = canvas.toDataURL("image/png"); 
            const link = document.createElement('a');
            
            link.href = imageURL;
            link.download = `spasibo_${outputName.textContent.toLowerCase().replace(/\s/g, '_')}_${Date.now()}.png`; // Удобное имя файла
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            downloadButton.style.display = 'block'; // Снова показываем кнопку
        }).catch(err => {
            console.error('Ошибка при генерации изображения:', err);
            alert('Не удалось сгенерировать открытку. Проверьте консоль для деталей.');
            downloadButton.style.display = 'block';
        });
    });

    // Инициализация при загрузке
    cardOutput.style.backgroundImage = `url(${getRandomBackground()})`;
    downloadButton.style.display = 'none';
});

