// Курсовая работа на тему "Симуляция двойного маятника"

// Физика
const G = 9.81; // Ускорение свободного падения (м/с^2)

// Параметры системы (задаются слайдерами)
let mass1;       // Масса 1-й массы (кг)
let mass2;       // Масса 2-й массы (кг)
let length1;     // Длина 1-го плеча (м)
let length2;     // Длина 2-го плеча (м)
let gMultiplier; // Множитель gravity (в единицах g)
let gravity;     // Текущее ускорение свободного падения с учётом множителя (м/с^2)

// Начальные условия
let startPhi1 = 0;        // Начальный угол 1-й массы (рад)
let startPhi2 = Math.PI;  // Начальный угол 2-й массы (рад)
let startOmega1 = 0.8;    // Начальная угловая скорость 1-й массы (рад/с)
let startOmega2 = 0.5;    // Начальная угловая скорость 2-й массы (рад/с)

// Текущее состояние системы
let phi1 = startPhi1;       // Текущий угол 1-й массы (рад)
let phi2 = startPhi2;       // Текущий угол 2-й массы (рад)
let omega1 = startOmega1;   // Текущая угловая скорость 1-й массы (рад/с)
let omega2 = startOmega2;   // Текущая угловая скорость 2-й массы (рад/с)
let mass1X, mass1Y;         // Координаты 1-й массы
let mass2X, mass2Y;         // Координаты 2-й массы

// Параметры симуляции
const PX_PER_METER = 100;
const DT = 0.005;                // Шаг интегрирования (с) (точность симуляции)
const MAX_FRAME_TIME = 0.1;      // Защита от больших скачков времени (например, вкладка подвисла) (с)
const MAX_STEPS_PER_FRAME = 500; // Защита от бесконечного while при сильных лагах
let simAccumulator = 0;          // Накопитель "долга" по времени симуляции в секундах (с)

// Интерфейс (размеры и расположение)
const SETTINGS_WIDTH = 200; // Ширина блока настроек
const PLOT_H = 200;         // Высота графика зависимости энергии от времени
const WIDTH = window.innerWidth;   // Ширина окна
const HEIGHT = window.innerHeight; // Высота окна
const SIMULATION_WINDOW_HEIGHT = HEIGHT - PLOT_H;         // Высота окна с симуляцией
const SIMULATION_WINDOW_WIDTH = WIDTH - SETTINGS_WIDTH;   // Ширина окна с симуляцией
const PLOT_W = SIMULATION_WINDOW_WIDTH;                   // Ширина графика энергии
const PLOT_X = SETTINGS_WIDTH;                            // Координата X графика энергии
const PLOT_Y = HEIGHT - PLOT_H;                           // Координата Y графика энергии
const ORIGIN_X = SIMULATION_WINDOW_WIDTH / 2 + SETTINGS_WIDTH; // Координата X точки подвеса
const ORIGIN_Y = SIMULATION_WINDOW_HEIGHT / 2;                 // Координата Y точки подвеса
const L_MAX = Math.min(SIMULATION_WINDOW_HEIGHT, SIMULATION_WINDOW_WIDTH) / 4; // Максимальная длина плеча маятника

// Элементы интерфейса
const BTN_W = 80; // Длина кнопок
const BTN_H = 24; // Ширина кнопок

// Оформление интерфейса
const TEXT_COLOR = '#9b9b9b';   // Цвет текста боковой панели
const ACCENT_COLOR = '#0060DF'; // Акцентный цвет
const TITLE_FONT_SIZE = 16;       // Размер шрифта заголовков
const FONT_SIZE = 14;             // Размер шрифта подписей
const BUTTON_FONT_SIZE = 14;      // Размер шрифта кнопок

// График энергии
const ENERGY_HISTORY = [];                   // Массив точек графика зависимости энергии от времени
const MAX_HISTORY = SIMULATION_WINDOW_WIDTH; // Кол-во точек на графике зависимости энергии от времени
let energyMax = 0;                           // Максимальная энергия на графике

// Поверхности для отрисовки
let settingsGraphics; // Поверхность для блока настроек
let trailGraphics;    // Поверхность для траектории 2-й массы
let energyGraphics;   // Поверхность для графика энергии

// UI-элементы панели настроек
let settingsButton; // Кнопка открытия панели НУ
let okButton;       // Кнопка подтверждения НУ
let cancelButton;   // Кнопка отмены НУ

let mass1Slider;       // Слайдер массы 1
let mass2Slider;       // Слайдер массы 2
let length1Slider;     // Слайдер длины 1
let length2Slider;     // Слайдер длины 2
let gMultiplierSlider; // Слайдер множителя gravity

let phi1Input;   // Поле ввода угла phi1
let phi2Input;   // Поле ввода угла phi2
let omega1Input; // Поле ввода omega1
let omega2Input; // Поле ввода omega2

let phi1Label;   // Подпись к полю ввода phi1
let phi2Label;   // Подпись к полю ввода phi2
let omega1Label; // Подпись к полю ввода omega1
let omega2Label; // Подпись к полю ввода omega2

let trailCheckbox;    // Чекбокс отображения траектории
let gradientCheckbox; // Чекбокс градиентного режима

// Заголовки и разделители
let modelParametersTitle; // Заголовок "Model parameters"
let trailParametersTitle; // Заголовок "Trail"
let divider1;             // Разделитель 1
let divider2;             // Разделитель 2
let divider3;             // Разделитель 3

// Подписи и подсказки значений
let mass1Label;       // Подпись слайдера массы 1
let mass2Label;       // Подпись слайдера массы 2
let length1Label;     // Подпись слайдера длины 1
let length2Label;     // Подпись слайдера длины 2
let gMultiplierLabel; // Подпись слайдера gravity

let mass1ValueTag;       // Баббл значения массы 1
let mass2ValueTag;       // Баббл значения массы 2
let length1ValueTag;     // Баббл значения длины 1
let length2ValueTag;     // Баббл значения длины 2
let gMultiplierValueTag; // Баббл значения gravity

let speedSlider;   // Слайдер скорости симуляции
let speedLabel;    // Подпись слайдера скорости
let speedValueTag; // Баббл значения скорости

// Кнопки управления
let clearTrailButton; // Кнопка очистки траектории
let restartButton;    // Кнопка перезапуска
let pauseButton;      // Кнопка паузы

// Флаги
let paused = false; // Флаг паузы симуляции


function styleUiCheckbox(cb) {
  const input = cb.elt.querySelector('input');
  if (input) input.style.accentColor = ACCENT_COLOR;
  cb.style('color', TEXT_COLOR);
}

function styleUiButton(btn, w = BTN_W, h = BTN_H) { // Функция кастомизации кнопки
    btn.size(w, h);
    btn.style('box-sizing', 'border-box');
    btn.style('font-family', 'Inter, sans-serif');
    btn.style('font-weight', '500');
    btn.style('font-size', `${BUTTON_FONT_SIZE}px`);
    btn.style('background-color', '#2b3440');
    btn.style('color', ACCENT_COLOR);
    btn.style('border', '0px solid #3a4553');
    btn.style('border-radius', '6px');
    btn.style('cursor', 'pointer');

    btn.mouseOver(() => btn.style('background-color', '#3a4553'));
    btn.mouseOut(() => btn.style('background-color', '#2b3440'));
}

function styleUiButtonTransparent(btn, w = BTN_W, h = BTN_H) { // Функция кастомизации кнопки без фона
    btn.size(w, h);
    btn.style('box-sizing', 'border-box');
    btn.style('font-family', 'Inter, sans-serif');
    btn.style('font-weight', '500');
    btn.style('font-size', `${BUTTON_FONT_SIZE}px`);
    btn.style('background-color', '#1C2127'); // 28, 33, 39 (Цвет боковой панели)
    btn.style('opacity', '1'); // Значение 0 делает кнопку полностью невидимой
    btn.style('color', ACCENT_COLOR);
    btn.style('border', '0px solid #1C2127');
    btn.style('cursor', 'pointer');  
}

function styleUiButtonAccent(btn, w = BTN_W, h = BTN_H) { // Функция кастомизации выделенной кнопки
    btn.size(w, h);
    btn.style('box-sizing', 'border-box');
    btn.style('font-family', 'Inter, sans-serif');
    btn.style('font-weight', '500');
    btn.style('font-size', '12px');
    btn.style('background-color', ACCENT_COLOR);
    btn.style('color', '#ffffff');
    btn.style('border', '0px solid #3a4553');
    btn.style('border-radius', '6px');
    btn.style('cursor', 'pointer');

    btn.mouseOver(() => btn.style('background-color', '#3a4553')); // ИЗМЕНИ ЦВЕТ -------------------------------------------------
    btn.mouseOut(() => btn.style('background-color', ACCENT_COLOR));
}

function styleUiLabel(div) { // Функция кастомизации подписи слайдеров
    div.style('color', TEXT_COLOR);
    div.style('font-family', 'Inter, sans-serif');
    div.style('font-size', `${FONT_SIZE}px`);
    div.style('font-weight', '350');
}

function injectSliderCss() {
    const css = `
    input[type=range].ui-slider{
        -webkit-appearance:none;
        appearance:none;
        WIDTH:100%;
        HEIGHT:22px;
        background:transparent;
        cursor:pointer;
    }
    input[type=range].ui-slider:focus{ outline:none; }

    /* ===== Chrome/Edge/Safari (WebKit) ===== */
    input[type=range].ui-slider::-webkit-slider-runnable-track{
        HEIGHT:4px;
        border-radius:999px;
        background: linear-gradient(var(--ui-fill, ${ACCENT_COLOR}) 0 0) 0/var(--ui-pct, 0%) 100% no-repeat
                    var(--ui-track, #3a4553);
    }
    input[type=range].ui-slider::-webkit-slider-thumb{
        -webkit-appearance:none;
        WIDTH:14px;
        HEIGHT:14px;
        border-radius:50%;
        background: var(--ui-thumb, ${ACCENT_COLOR});
        border: 2px solid var(--ui-thumb-border, #1C2127);
        margin-top:-5px; /* центрируем кружок относительно полосы */
    }

    /* ===== Firefox ===== */
    input[type=range].ui-slider::-moz-range-track{
        HEIGHT:4px;
        border-radius:999px;
        background: var(--ui-track, #3a4553);
    }
    input[type=range].ui-slider::-moz-range-progress{
        HEIGHT:4px;
        border-radius:999px;
        background: var(--ui-fill, ${ACCENT_COLOR});
    }
    input[type=range].ui-slider::-moz-range-thumb{
        WIDTH:14px;
        HEIGHT:14px;
        border-radius:50%;
        background: var(--ui-thumb, ${ACCENT_COLOR});
        border: 2px solid var(--ui-thumb-border, #1C2127);
    }`;

    const tag = document.createElement('style');
    tag.textContent = css;
    document.head.appendChild(tag);
}

function styleUiValueTag(tag) {
  tag.style('font-family', 'Inter, sans-serif');
  tag.style('font-size', '11px');
  tag.style('font-weight', '600');
  tag.style('color', '#ffffff');
  tag.style('background', '#2b3440');
  tag.style('border', '1px solid #3a4553');
  tag.style('border-radius', '999px');
  tag.style('padding', '2px 6px');
  tag.style('pointer-events', 'none'); // чтобы не мешала тянуть слайдер
  tag.style('user-select', 'none');
  tag.style('white-space', 'nowrap');
}

function styleUiSlider(slider, {
  track = '#3a4553',       // цвет полосы (фон)
  fill  = '#0060DF',       // цвет “залитой” части до кружка
  thumb = '#0060DF',       // цвет кружка
  thumbBorder = '#1C2127'  // обводка кружка (красиво на тёмном фоне)
} = {}) {

  slider.addClass('ui-slider');
  slider.style('--ui-track', track);
  slider.style('--ui-fill', fill);
  slider.style('--ui-thumb', thumb);
  slider.style('--ui-thumb-border', thumbBorder);

  // Для Chrome/Edge/Safari: двигаем процент заливки
  const updatePct = () => {
    const min = Number(slider.elt.min);
    const max = Number(slider.elt.max);
    const val = Number(slider.value());
    const pct = ((val - min) * 100) / (max - min);
    slider.elt.style.setProperty('--ui-pct', `${pct}%`);
  };

  updatePct();
  slider.input(updatePct)
}

function attachFloatingSliderValue(slider, tag, {
  x, y, w,
  format = (v) => v
} = {}) {
  const update = () => {
    const min = Number(slider.elt.min);
    const max = Number(slider.elt.max);
    const val = Number(slider.value());
    const thumbW = FONT_SIZE;
    const yOffset = FONT_SIZE + 10;

    const pct = (val - min) / (max - min);
    tag.html(format(val));

    // Ширина тега для аккуратного центрирования
    const tagW = tag.elt.getBoundingClientRect().WIDTH || 0;

    // Позиция центра thumb по X
    const centerX = x + pct * (w - thumbW) - thumbW / 2;

    // Чтобы подпись не вылезала за края
    const leftClamped = Math.min(x + w - tagW / 2, Math.max(x + tagW / 2, centerX));

    tag.position(leftClamped - tagW / 2, y + yOffset);
  };

  update();
  slider.input(update);
  return update;
}

function layoutSidebar() {
    // Основные параметры панели настроек
    const PAD = 14;                 // Внутренний отступ панели от левого и верхнего края
    const TITLE_GAP = 50;           // Расстояние от заголовка секции до первого элемента секции
    const LABEL_TO_SLIDER = 18;     // Расстояние между подписью параметра и самим слайдером
    const ROW_GAP = 50;             // Вертикальное расстояние между слайдерами
    const CHECKBOX_GAP = TITLE_GAP - 18; // Расстояние между чекбоксами в блоке Trail
    const DIVIDER_GAP = 14;         // Отступ сверху и снизу от линии-разделителя
    const DIVIDER_THICKNESS = 3;    // Толщина разделителя (из HTML)

    // Базовые параметры для позиционирования элементов
    const x = PAD;                          // базовая координата X для всех элементов панели
    const w = SETTINGS_WIDTH - PAD * 2;     // рабочая ширина элементов панели (с учётом отступов)

    let y = PAD - TITLE_FONT_SIZE; // "курсор" текущей вертикальной позиции (двигается сверху вниз по мере добавления элементов)

    function placeTitle(title) {// Функция размещения заголовка секции
        title.position(x, y);
        y += TITLE_GAP;
    }

    function placeDivider(divider) { // Функция размещения линии-разделителя
        y += DIVIDER_GAP;
        divider.position(0, y);
        divider.size(SETTINGS_WIDTH, DIVIDER_THICKNESS);

        y += DIVIDER_GAP + DIVIDER_THICKNESS;
    }

    function placeSlider(slider, label, tag, units) { // Функция размещения пары "подпись + слайдер"
        label.position(x + 2, y);
        y += LABEL_TO_SLIDER;
        slider.position(x, y);
        slider.size(w);
        attachFloatingSliderValue(slider, tag, {
        x, y, w,
        format: (v) => `${v.toFixed(1)}${units}`
    });
        y += ROW_GAP;
    }


    // Блок настройки основных параметров системы (Model parameters)
    placeTitle(modelParametersTitle);

    placeSlider(mass1Slider, mass1Label, mass1ValueTag, ' kg');
    placeSlider(mass2Slider, mass2Label, mass2ValueTag, ' kg');
    placeSlider(length1Slider, length1Label, length1ValueTag, ' m');
    placeSlider(length2Slider, length2Label, length2ValueTag, ' m');
    placeSlider(gMultiplierSlider, gMultiplierLabel, gMultiplierValueTag, ' g');

    y -= 19;

    placeDivider(divider1);

    // Блок настройки траектории (Trail)
    placeTitle(trailParametersTitle);

    // Кнопка очистки траектории
    // располагается справа от заголовка секции
    clearTrailButton.position(
        x + w - BTN_W,
        y - TITLE_GAP + BTN_H - 9
    );

    // Чекбокс отображения траектории
    trailCheckbox.position(x - 2, y);
    y += CHECKBOX_GAP;

    // Чекбокс режима градиента
    gradientCheckbox.position(x - 2, y);
    y += 6;

    placeDivider(divider2);
  
    y += FONT_SIZE;

    placeSlider(speedSlider, speedLabel, speedValueTag, 'x');

    y -= 20;

    // Кнопки Restart и Pause
    pauseButton.position(x, y + BTN_H);
    restartButton.position(x + BTN_W + 10, y + BTN_H);

    y += BTN_H + DIVIDER_GAP;

    placeDivider(divider3);

    y += DIVIDER_GAP;

    const labelToInputOffsetX = 80;
    const rowSpacingY = 30;

    settingsButton.position(x, y);

    y += 10;

    phi1Label.position(x, y);
    phi1Input.position(x + labelToInputOffsetX, y);

    y += rowSpacingY;

    phi2Label.position(x, y);
    phi2Input.position(x + labelToInputOffsetX, y);

    y += rowSpacingY;

    omega1Label.position(x, y);
    omega1Input.position(x + labelToInputOffsetX, y);

    y += rowSpacingY;

    omega2Label.position(x, y);
    omega2Input.position(x + labelToInputOffsetX, y);

    y += rowSpacingY;

    okButton.position(x, y);
    cancelButton.position(x + labelToInputOffsetX, y);
}

function calculateCoordinates() { // Вычисление координат масс
    mass1X = ORIGIN_X + length1 * Math.sin(phi1);
    mass1Y = ORIGIN_Y + length1 * Math.cos(phi1);
    mass2X = mass1X + length2 * Math.sin(phi2);
    mass2Y = mass1Y + length2 * Math.cos(phi2);
}

function restartSimulation() {
    phi1 = startPhi1; 
    phi2 = startPhi2;
    omega1 = startOmega1;
    omega2 = startOmega2;
    calculateCoordinates();
    trailGraphics.clear();
    ENERGY_HISTORY.length = 0;
    energyMax = 0;
    simAccumulator = 0;
}

function computeDerivatives(phi1, phi2, omega1, omega2) {
    // Вычисляем delta и т.д. на основе phi1, phi2
    let delta = phi1 - phi2;
    let sinDelta = Math.sin(delta);
    let cosDelta = Math.cos(delta);
    let denom = 2*mass1 + mass2 - mass2*Math.cos(2*delta);
    if (Math.abs(denom) < 1e-6) {denom = 1e-6;} // Защита от деления на ноль

    // Угловое ускорение первой массы
    let a1_1 = -gravity * (2*mass1 + mass2) * Math.sin(phi1);
    let a1_2 = -mass2 * gravity * Math.sin(phi1 - 2*phi2);
    let a1_3 = -2 * sinDelta * mass2 * (omega2*omega2*length2 + omega1*omega1*length1*cosDelta);
    let a1 = (a1_1 + a1_2 + a1_3) / (length1 * denom);

    // Угловое ускорение второй массы
    let a2_1 = 2 * sinDelta * (omega1*omega1*length1*(mass1 + mass2) + gravity*(mass1 + mass2)*Math.cos(phi1) + omega2*omega2*length2*mass2*cosDelta);
    let a2 = a2_1 / (length2 * denom);

    return {
        dphi1: omega1,
        dphi2: omega2,
        domega1: a1,
        domega2: a2
    };
}

function rk4(dt) { // Метод Рунге–Кутты 4-го порядка
    // Текущее состояние (локальные копии, чтобы корректно посчитать k1..k4)
    let phi1Local = phi1;
    let phi2Local = phi2;
    let omega1Local = omega1;
    let omega2Local = omega2;

    let k1 = computeDerivatives(phi1Local, phi2Local, omega1Local, omega2Local);

    let k2 = computeDerivatives(
        phi1Local + 0.5 * dt * k1.dphi1,
        phi2Local + 0.5 * dt * k1.dphi2,
        omega1Local + 0.5 * dt * k1.domega1,
        omega2Local + 0.5 * dt * k1.domega2
    );

    let k3 = computeDerivatives(
        phi1Local + 0.5 * dt * k2.dphi1,
        phi2Local + 0.5 * dt * k2.dphi2,
        omega1Local + 0.5 * dt * k2.domega1,
        omega2Local + 0.5 * dt * k2.domega2
    );

    let k4 = computeDerivatives(
        phi1Local + dt * k3.dphi1,
        phi2Local + dt * k3.dphi2,
        omega1Local + dt * k3.domega1,
        omega2Local + dt * k3.domega2
    );

    // Итоговое изменение
    phi1   += dt/6 * (k1.dphi1   + 2*k2.dphi1   + 2*k3.dphi1   + k4.dphi1);
    phi2   += dt/6 * (k1.dphi2   + 2*k2.dphi2   + 2*k3.dphi2   + k4.dphi2);
    omega1 += dt/6 * (k1.domega1 + 2*k2.domega1 + 2*k3.domega1 + k4.domega1);
    omega2 += dt/6 * (k1.domega2 + 2*k2.domega2 + 2*k3.domega2 + k4.domega2);
}


function getVelocities() { // Расчет скоростей масс
    // Расчет скорости 1-й массы
    let v1x = length1 * Math.cos(phi1) * omega1;
    let v1y = -length1 * Math.sin(phi1) * omega1;

    // Расчет скорости 2-й массы
    let v2x = v1x + length2 * Math.cos(phi2) * omega2;
    let v2y = v1y - length2 * Math.sin(phi2) * omega2;

    return { v1x, v1y, v2x, v2y };
}

function calculateEnergies() {
    let { v1x, v1y, v2x, v2y } = getVelocities();
    let v1sq = v1x * v1x + v1y * v1y;
    let v2sq = v2x * v2x + v2y * v2y;
    let kinetic = 0.5 * mass1 * v1sq + 0.5 * mass2 * v2sq;
    
    let offset = gravity * 2 * (mass1 + mass2) * L_MAX;
    let potential = gravity * (mass1 * (ORIGIN_Y - mass1Y) + mass2 * (ORIGIN_Y - mass2Y)) + offset;

    let total = kinetic + potential;
    let max = Math.max(total, kinetic);

    return { kinetic, potential, total, max };
}

function drawEnergyPlots() {
    // Настраиваем слой
    energyGraphics.background(28, 33, 39, 255);
    energyGraphics.strokeWeight(2);
    energyGraphics.noFill();

    let xStep = (PLOT_W - 30) / (MAX_HISTORY - 1);
    let yScale = (PLOT_H - 30) / energyMax;

    // Суммарная энергия (белая)
    energyGraphics.stroke(255, 255, 255);
    energyGraphics.beginShape();
    for (let i = 0; i < ENERGY_HISTORY.length; i++) {
        let x = 20 + i * xStep;
        let y = PLOT_H - 20 - ENERGY_HISTORY[i].total * yScale;
        energyGraphics.vertex(x, y);
    }
    energyGraphics.endShape();

    // Кинетическая энергия (красная)
    energyGraphics.stroke(255, 100, 100);
    energyGraphics.beginShape();
    for (let i = 0; i < ENERGY_HISTORY.length; i++) {
        let x = 20 + i * xStep;
        let y = PLOT_H - 20 - ENERGY_HISTORY[i].kinetic * yScale;
        energyGraphics.vertex(x, y);
    }
    energyGraphics.endShape();

    // Потенциальная энергия (синяя)
    energyGraphics.stroke(100, 150, 255);
    energyGraphics.beginShape();
    for (let i = 0; i < ENERGY_HISTORY.length; i++) {
        let x = 20 + i * xStep;
        let y = PLOT_H - 20 - ENERGY_HISTORY[i].potential * yScale;
        energyGraphics.vertex(x, y);
    }
    energyGraphics.endShape();

    // Рисуем оси
    energyGraphics.stroke(100);
    energyGraphics.line(20, PLOT_H - 20, PLOT_W - 10, PLOT_H - 20); // Ось времени
    energyGraphics.line(20, 10, 20, PLOT_H - 20); // Ось энергии

    // Подписи
    energyGraphics.fill(255);
    energyGraphics.noStroke();
    energyGraphics.textSize(10);
    energyGraphics.text('Total', PLOT_W - 30, 20);
    energyGraphics.fill(100, 150, 255);
    energyGraphics.text('Potential', PLOT_W - 48, 35);
    energyGraphics.fill(255, 100, 100);
    energyGraphics.text('Kinetic', PLOT_W - 39, 50);
    energyGraphics.fill('white');
    energyGraphics.text('E', 7, 15);
    energyGraphics.text('T', PLOT_W - 15, PLOT_H - 7);

    // Выводим слой на основной холст
    image(energyGraphics, PLOT_X, PLOT_Y);
}

function getTrailColor() { // Цвет траектории зависит от скорости
    let { v1x, v1y, v2x, v2y } = getVelocities();
    let v2sq = v2x * v2x + v2y * v2y;

    // Значение цвета
    if (gravity < 11) {return v2sq / 200;}
    else {return v2sq / gravity / 20;}
}

function settingsHandler() {
    // Показываем панель
    phi1Label.show();
    phi1Input.show();
    phi2Label.show();
    phi2Input.show();
    omega1Label.show();
    omega1Input.show();
    omega2Label.show();
    omega2Input.show();
    okButton.show();
    cancelButton.show();

    // Прячем кнопку Settings
    settingsButton.hide();
}

function applySettings() {
    // Считываем значения из полей
    let newPhi1 = parseFloat(phi1Input.value());
    let newPhi2 = parseFloat(phi2Input.value());
    let newOmega1 = parseFloat(omega1Input.value());
    let newOmega2 = parseFloat(omega2Input.value());

    // Если введено не число, оставляем старое значение
    if (!isNaN(newPhi1)) startPhi1 = newPhi1;
    if (!isNaN(newPhi2)) startPhi2 = newPhi2;
    if (!isNaN(newOmega1)) startOmega1 = newOmega1;
    if (!isNaN(newOmega2)) startOmega2 = newOmega2;

    restartSimulation();

    // Скрываем панель
    phi1Label.hide();
    phi1Input.hide();
    phi2Label.hide();
    phi2Input.hide();
    omega1Label.hide();
    omega1Input.hide();
    omega2Label.hide();
    omega2Input.hide();
    okButton.hide();
    cancelButton.hide();

    // Показываем кнопку Settings
    settingsButton.show();
}

function cancelSettings() {
    phi1Label.hide();
    phi1Input.hide();
    phi2Label.hide();
    phi2Input.hide();
    omega1Label.hide();
    omega1Input.hide();
    omega2Label.hide();
    omega2Input.hide();
    okButton.hide();
    cancelButton.hide();

    settingsButton.show();
}

function setup() { // Отрисовка интерфейса
    injectSliderCss();
    
    createCanvas(WIDTH, HEIGHT);
    trailGraphics = createGraphics(SIMULATION_WINDOW_WIDTH, SIMULATION_WINDOW_HEIGHT);
    trailGraphics.clear();
    energyGraphics = createGraphics(PLOT_W, PLOT_H);
    settingsGraphics = createGraphics(SETTINGS_WIDTH, HEIGHT);
    settingsGraphics.clear();

    modelParametersTitle = createDiv("Model parameters");
    modelParametersTitle.addClass("section-title");

    trailParametersTitle = createDiv("Trail");
    trailParametersTitle.addClass("section-title");

    mass1Slider = createSlider(0.1, 5, 1, 0.1);
    mass2Slider = createSlider(0.1, 5, 1, 0.1);
    length1Slider = createSlider(0.1, L_MAX / PX_PER_METER, 1, 0.1);
    length2Slider = createSlider(0.1, L_MAX / PX_PER_METER, 1.5, 0.1);
    gMultiplierSlider  = createSlider(0, 10, 1, 0.1);
    speedSlider = createSlider(0.1, 5, 1, 0.1);

    styleUiSlider(mass1Slider);
    styleUiSlider(mass2Slider);
    styleUiSlider(length1Slider);
    styleUiSlider(length2Slider);
    styleUiSlider(gMultiplierSlider);
    styleUiSlider(speedSlider);

    mass1Label = createDiv('Mass 1');
    mass2Label = createDiv('Mass 2');
    length1Label = createDiv('Length 1');
    length2Label = createDiv('Length 2');
    gMultiplierLabel  = createDiv('Acceleration');
    speedLabel  = createDiv('Speed');

    mass1ValueTag = createDiv();
    mass2ValueTag = createDiv();
    length1ValueTag = createDiv();
    length2ValueTag = createDiv();
    gMultiplierValueTag = createDiv();
    speedValueTag = createDiv();

    styleUiLabel(mass1Label);
    styleUiLabel(mass2Label);
    styleUiLabel(length1Label);
    styleUiLabel(length2Label);
    styleUiLabel(gMultiplierLabel);
    styleUiLabel(speedLabel);

    styleUiValueTag(mass1ValueTag);
    styleUiValueTag(mass2ValueTag);
    styleUiValueTag(length1ValueTag);
    styleUiValueTag(length2ValueTag);
    styleUiValueTag(gMultiplierValueTag);
    styleUiValueTag(speedValueTag);

    divider1 = createDiv();
    divider2 = createDiv();
    divider3 = createDiv();

    divider1.addClass("section-divider");
    divider2.addClass("section-divider");
    divider3.addClass("section-divider");

    clearTrailButton = createButton('Clear trail');
    restartButton = createButton('Restart');

    styleUiButtonTransparent(clearTrailButton, BTN_W, BTN_H);
    clearTrailButton.mousePressed(() => trailGraphics.clear());
    styleUiButton(restartButton, BTN_W, BTN_H);
    restartButton.mousePressed(() => restartSimulation());

    trailCheckbox = createCheckbox('Show trail', true);
    gradientCheckbox = createCheckbox('Gradient mode', true);

    styleUiCheckbox(trailCheckbox);
    styleUiCheckbox(gradientCheckbox);

    pauseButton = createButton('Pause');
    styleUiButtonAccent(pauseButton, BTN_W, BTN_H);
    pauseButton.mousePressed(() => {
        paused = !paused;
        pauseButton.html(paused ? 'Resume' : 'Pause');
    });

    settingsButton = createButton('Change start parameters');
    styleUiButtonTransparent(settingsButton);
    settingsButton.style('text-align', 'left');
    settingsButton.style('padding-left', '1px');
    settingsButton.size(BTN_W + 20, BTN_H + 20);
    settingsButton.mousePressed(settingsHandler);

    okButton = createButton('OK');
    cancelButton = createButton('Cancel');

    okButton.mousePressed(applySettings);
    cancelButton.mousePressed(cancelSettings);
    
    okButton.hide();
    cancelButton.hide();

    phi1Label = createDiv('phi1:');
    phi2Label = createDiv('phi2:');
    omega1Label = createDiv('omega1:');
    omega2Label = createDiv('omega2:');

    phi1Label.style('color', 'white');
    phi2Label.style('color', 'white');
    omega1Label.style('color', 'white');
    omega2Label.style('color', 'white');

    phi1Label.hide();
    phi2Label.hide();
    omega1Label.hide();
    omega2Label.hide();

    phi1Input = createInput(startPhi1.toFixed(2));
    phi2Input = createInput(startPhi2.toFixed(2));
    omega1Input = createInput(startOmega1.toFixed(2));
    omega2Input = createInput(startOmega2.toFixed(2));
    
    phi1Input.size(60);
    phi2Input.size(60);
    omega1Input.size(60);
    omega2Input.size(60);

    phi1Input.hide();
    phi2Input.hide();
    omega1Input.hide();
    omega2Input.hide();

    layoutSidebar();
}

function draw() {
    background(39, 42, 47, 255);
    settingsGraphics.background(28, 33, 39, 255);
    image(settingsGraphics, 0, 0);

    textFont('Inter');

    mass1 = mass1Slider.value();
    mass2 = mass2Slider.value();
    length1 = length1Slider.value() * PX_PER_METER;
    length2 = length2Slider.value() * PX_PER_METER;
    gMultiplier = gMultiplierSlider.value();
    gravity = PX_PER_METER * gMultiplier * G;

    // Сохранение координат 2-й массы
    let prevMass2X = mass2X;
    let prevMass2Y = mass2Y;

    calculateCoordinates();

    // Отрисовка траектории движения
    if (gradientCheckbox.checked()) {
        let trailColor = getTrailColor();
        trailGraphics.stroke(trailColor * 16, trailColor * 4, trailColor, 255);}
    else {trailGraphics.stroke(255, 100, 0, 100);}
    trailGraphics.strokeWeight(1);
    trailGraphics.line(prevMass2X - SETTINGS_WIDTH, prevMass2Y, mass2X - SETTINGS_WIDTH, mass2Y); // траектория движения 2-й массы
    if (trailCheckbox.checked()) {image(trailGraphics, SETTINGS_WIDTH, 0);}

    // Отрисовка маятника
    stroke(120);
    line(ORIGIN_X, ORIGIN_Y, mass1X, mass1Y);
    line(mass1X, mass1Y, mass2X, mass2Y);
    
    stroke(255);
    fill(255);
    circle(ORIGIN_X, ORIGIN_Y, 3);
    circle(mass1X, mass1Y, Math.sqrt(mass1) * 10);
    circle(mass2X, mass2Y, Math.sqrt(mass2) * 10);

    // Расчет и сохранение значений энергий
    let energies = calculateEnergies();
    energyMax = Math.max(energyMax, energies.max);
    ENERGY_HISTORY.push(energies);
    if (ENERGY_HISTORY.length > MAX_HISTORY) {
        let removed = ENERGY_HISTORY.shift();
        if (removed.max >= energyMax) {
            energyMax = 0;
            for (let e of ENERGY_HISTORY) {
                energyMax = Math.max(energyMax, e.max);
            }
        }
    }

    drawEnergyPlots();

    // Нахождение следующего состояния системы
    if (!paused) {
        const frameSec = Math.min(deltaTime / 1000, MAX_FRAME_TIME);
        const timeScale = Number(speedSlider.value());

        simAccumulator += frameSec * timeScale; // сколько сим-времени надо "прожить"

        const MAX_STEP = 0.005; // максимальный шаг интегрирования (сек)
        let steps = 0;

        while (simAccumulator > 0 && steps < MAX_STEPS_PER_FRAME) {
             const h = Math.min(MAX_STEP, simAccumulator);
             rk4(h);
            simAccumulator -= h;
            steps++;
        }

        if (steps >= MAX_STEPS_PER_FRAME) simAccumulator = 0;
    }
}