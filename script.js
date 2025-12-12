document.addEventListener('DOMContentLoaded', () => {
    const cardForm = document.getElementById('card-form');
    const cardOutput = document.getElementById('card-output');
    const outputName = document.getElementById('output-name');
    const outputText = document.getElementById('output-text');
    const downloadButton = document.getElementById('download-button');

    // !!! ПУТИ ИСПРАВЛЕНЫ: убран / для корректной работы на GitHub Pages !!!
    const backgroundImages = [
        'backgrounds/bg1.png', 
        'backgrounds/bg2.png', 
        'backgrounds/bg3.png'
        // Добавьте все ваши фоны сюда
    ];

    /**
     * Выбирает случайный фон из списка
     * @returns {string} URL фонового изображения
     */
    function getRandomBackground() {
        if (backgroundImages.length === 0) {
            console.warn("В массиве backgroundImages нет фонов.");
            return '';
        }
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        return backgroundImages[randomIndex];
    }

    // Обработчик отправки формы
    cardForm.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const recipientName = document.getElementById('recipient-name').value;
        const gratitudeText = document.getElementById('gratitude-text').value;

        // Обновляем текст открытки
        // Используем 'trim()' для удаления лишних пробелов,
        // и если поле пустое, оставляем текст по умолчанию.
        outputName.textContent = recipientName.trim() || 'Имя получателя';
        outputText.textContent = gratitudeText.trim() || 'Текст благодарности';
        
        // Устанавливаем случайный фон
        const randomBg = getRandomBackground();
        cardOutput.style.backgroundImage = `url(${randomBg})`;

        // Показываем кнопку скачивания
        downloadButton.style.display = 'block';
    });

    // Обработчик кнопки скачивания
    downloadButton.addEventListener('click', () => {
        downloadButton.style.display = 'none'; // Скрываем кнопку перед скриншотом
        
        // Генерируем изображение из HTML элемента
        html2canvas(cardOutput, {
            scale: 2, 
            allowTaint: true, 
            useCORS: true, 
            logging: false
        }).then(canvas => {
            const imageURL = canvas.toDataURL("image/png"); 
            const link = document.createElement('a');
            
            link.href = imageURL;
            // Создаем имя файла, используя имя получателя
            const fileName = outputName.textContent.toLowerCase().replace(/\s/g, '_').substring(0, 20);
            link.download = `spasibo_${fileName || 'karta'}_${Date.now()}.png`; 
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            downloadButton.style.display = 'block'; // Снова показываем кнопку
        }).catch(err => {
            console.error('Ошибка при генерации изображения:', err);
            alert('Не удалось сгенерировать открытку. Убедитесь, что фоновые изображения доступны.');
            downloadButton.style.display = 'block';
        });
    });

    // Инициализация при загрузке
    cardOutput.style.backgroundImage = `url(${getRandomBackground()})`;
    downloadButton.style.display = 'none';
});
