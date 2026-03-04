// Курсовая работа на тему "Симуляция двойного маятника"

const G = 9.81; // Ускорение свободного падения

let m1, m2, l1, l2, g; // Основные параметры системы

// Начальные условия
let start_fi1 = 0;
let start_fi2 = Math.PI;
let start_w1 = 0.8;
let start_w2 = 0.5;

let fi1 = start_fi1; 
let fi2 = start_fi2;
let w1 = start_w1;
let w2 = start_w2;
let x1, y1, x2, y2;
let energy_history = []; // Массив с точками графика зависимости энергии от времени
let energy_max = 0;

const dt = 0.05; // Точность симуляции

// Интерфейс
const WIDTH = window.innerWidth; // Ширина окна
const HEIGHT = window.innerHeight; // Высота окна
const SETTINGS_WIDTH = 200; // Ширина блока настроек
const PLOT_H = 200; // Высота графика зависимости энергии от времени
const SIMULATION_WINDOW_HEIGHT = HEIGHT - PLOT_H; // Высота окна с симуляцией
const SIMULATION_WINDOW_WIDTH = WIDTH - SETTINGS_WIDTH; // Ширина окна с симуляцией
const PLOT_W = SIMULATION_WINDOW_WIDTH; // Ширина графика
const ORIGIN_X = SIMULATION_WINDOW_WIDTH / 2 + SETTINGS_WIDTH; // Координата X точки подвеса
const ORIGIN_Y = SIMULATION_WINDOW_HEIGHT / 2; // Координата Y точки подвеса
const L_MAX = Math.min(SIMULATION_WINDOW_HEIGHT, SIMULATION_WINDOW_WIDTH) / 4; // Максимальная длина плеча маятника
const BTN_W = 80; // Длина кнопок
const BTN_H = 24; // Ширина кнопок
let settings_graphics; // Поверхность для блока с настройками
let settings_button, ok_button, cancel_button; // Кнопки для расширенной панели настроек
let m1_slider, m2_slider, l1_slider, l2_slider, g_slider; // Ползунки для настройки параметров системы
let fi1_input, fi2_input, w1_input, w2_input;  // Поля ввода НУ в расширенной панели настроек
let fi1_label, fi2_label, w1_label, w2_label; // Подписи для полей ввода
let trail_graphics; // Прозрачная поверхность для отрисовки траектории 2-й массы
let trail_checkbox; // Галочка для отрисовки траектории движения
let gradient_checkbox; // Галочки режима с траекторией, характеризующей скорость массы
let energy_graphics; // Поверхность для отрисовки графика зависимости энергии от времени
let plot_x, plot_y; // Координаты графика зависимости энергии от времени
let paused = false;
let model_parametrs_title, trail_parametrs_title;
let divider_1, divider_2, divider_3;
let m1_label, m2_label, l1_label, l2_label, g_label;
let trail_clear_button;
let restart_button, pause_button;
let speed_slider, speed_label, speed_value_tag;
let m1_value_tag, m2_value_tag, l1_value_tag, l2_value_tag, g_value_tag;
const textColor = '#9b9b9b';
const accentColor = '#0060DF';
const TITLE_FONT_SIZE = 16;
const FONT_SIZE = 14;
const BUTTON_FONT_SIZE = 14;
const max_history = SIMULATION_WINDOW_WIDTH; // Кол-во точек на графике зависимости энергии от времени


function styleUiCheckbox(cb) {
  const input = cb.elt.querySelector('input');
  if (input) input.style.accentColor = accentColor;
  cb.style('color', textColor);
}

function styleUiButton(btn, w = BTN_W, h = BTN_H) { // Функция кастомизации кнопки
    btn.size(w, h);
    btn.style('box-sizing', 'border-box');
    btn.style('font-family', 'Inter, sans-serif');
    btn.style('font-weight', '500');
    btn.style('font-size', `${BUTTON_FONT_SIZE}px`);
    btn.style('background-color', '#2b3440');
    btn.style('color', accentColor);
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
    btn.style('color', accentColor);
    btn.style('border', '0px solid #1C2127');
    btn.style('cursor', 'pointer');  
}

function styleUiButtonAccent(btn, w = BTN_W, h = BTN_H) { // Функция кастомизации выделенной кнопки
    btn.size(w, h);
    btn.style('box-sizing', 'border-box');
    btn.style('font-family', 'Inter, sans-serif');
    btn.style('font-weight', '500');
    btn.style('font-size', '12px');
    btn.style('background-color', accentColor);
    btn.style('color', '#ffffff');
    btn.style('border', '0px solid #3a4553');
    btn.style('border-radius', '6px');
    btn.style('cursor', 'pointer');

    btn.mouseOver(() => btn.style('background-color', '#3a4553')); // ИЗМЕНИ ЦВЕТ -------------------------------------------------
    btn.mouseOut(() => btn.style('background-color', accentColor));
}

function styleUiLabel(div) { // Функция кастомизации подписи слайдеров
    div.style('color', textColor);
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
        background: linear-gradient(var(--ui-fill, #0060DF) 0 0) 0/var(--ui-pct, 0%) 100% no-repeat
                    var(--ui-track, #3a4553);
    }
    input[type=range].ui-slider::-webkit-slider-thumb{
        -webkit-appearance:none;
        WIDTH:14px;
        HEIGHT:14px;
        border-radius:50%;
        background: var(--ui-thumb, #0060DF);
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
        background: var(--ui-fill, #0060DF);
    }
    input[type=range].ui-slider::-moz-range-thumb{
        WIDTH:14px;
        HEIGHT:14px;
        border-radius:50%;
        background: var(--ui-thumb, #0060DF);
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
    placeTitle(model_parametrs_title);

    placeSlider(m1_slider, m1_label, m1_value_tag, ' kg');
    placeSlider(m2_slider, m2_label, m2_value_tag, ' kg');
    placeSlider(l1_slider, l1_label, l1_value_tag, ' m');
    placeSlider(l2_slider, l2_label, l2_value_tag, ' m');
    placeSlider(g_slider, g_label, g_value_tag, ' g');

    y -= 19;

    placeDivider(divider_1);

    // Блок настройки траектории (Trail)
    placeTitle(trail_parametrs_title);

    // Кнопка очистки траектории
    // располагается справа от заголовка секции
    trail_clear_button.position(
        x + w - BTN_W,
        y - TITLE_GAP + BTN_H - 9
    );

    // Чекбокс отображения траектории
    trail_checkbox.position(x - 2, y);
    y += CHECKBOX_GAP;

    // Чекбокс режима градиента
    gradient_checkbox.position(x - 2, y);
    y += 6;

    placeDivider(divider_2);
  
    y += FONT_SIZE;

    placeSlider(speed_slider, speed_label, speed_value_tag, 'x');

    y -= 20;

    // Кнопки Restart и Pause
    pause_button.position(x, y + BTN_H);
    restart_button.position(x + BTN_W + 10, y + BTN_H);

    y += BTN_H + DIVIDER_GAP;

    placeDivider(divider_3);
}

function calculateCoordinates() { // Вычисление координат масс
    x1 = ORIGIN_X + l1 * Math.sin(fi1);
    y1 = ORIGIN_Y + l1 * Math.cos(fi1);
    x2 = x1 + l2 * Math.sin(fi2);
    y2 = y1 + l2 * Math.cos(fi2);
}

function restartSimulation() {
    fi1 = start_fi1; 
    fi2 = start_fi2;
    w1 = start_w1;
    w2 = start_w2;
    calculateCoordinates();
    trail_graphics.clear();
    energy_history = [];
    energy_max = 0;
}

function computeDerivatives(phi1, phi2, omega1, omega2) {
    // Вычисляем delta и т.д. на основе phi1, phi2
    let delta = phi1 - phi2;
    let sinDelta = Math.sin(delta);
    let cosDelta = Math.cos(delta);
    let denom = 2*m1 + m2 - m2*Math.cos(2*delta);
    if (Math.abs(denom) < 1e-6) {denom = 1e-6;} // Защита от деления на ноль

    // Угловое ускорение первой массы
    let a1_1 = -g * (2*m1 + m2) * Math.sin(phi1);
    let a1_2 = -m2 * g * Math.sin(phi1 - 2*phi2);
    let a1_3 = -2 * sinDelta * m2 * (omega2*omega2*l2 + omega1*omega1*l1*cosDelta);
    let a1 = (a1_1 + a1_2 + a1_3) / (l1 * denom);

    // Угловое ускорение второй массы
    let a2_1 = 2 * sinDelta * (omega1*omega1*l1*(m1 + m2) + g*(m1 + m2)*Math.cos(phi1) + omega2*omega2*l2*m2*cosDelta);
    let a2 = a2_1 / (l2 * denom);

    return {
        dphi1: omega1,
        dphi2: omega2,
        domega1: a1,
        domega2: a2
    };
}

function rk4(dt) { // Метод Рунге–Кутты 4-го порядка
    // Текущее состояние
    let phi1 = fi1, phi2 = fi2, omega1 = w1, omega2 = w2;

    let k1 = computeDerivatives(phi1, phi2, omega1, omega2);

    let k2 = computeDerivatives(
        phi1 + 0.5 * dt * k1.dphi1,
        phi2 + 0.5 * dt * k1.dphi2,
        omega1 + 0.5 * dt * k1.domega1,
        omega2 + 0.5 * dt * k1.domega2
    );

    let k3 = computeDerivatives(
        phi1 + 0.5 * dt * k2.dphi1,
        phi2 + 0.5 * dt * k2.dphi2,
        omega1 + 0.5 * dt * k2.domega1,
        omega2 + 0.5 * dt * k2.domega2
    );

    let k4 = computeDerivatives(
        phi1 + dt * k3.dphi1,
        phi2 + dt * k3.dphi2,
        omega1 + dt * k3.domega1,
        omega2 + dt * k3.domega2
    );

    // Итоговое изменение
    fi1 += dt/6 * (k1.dphi1 + 2*k2.dphi1 + 2*k3.dphi1 + k4.dphi1);
    fi2 += dt/6 * (k1.dphi2 + 2*k2.dphi2 + 2*k3.dphi2 + k4.dphi2);
    w1  += dt/6 * (k1.domega1 + 2*k2.domega1 + 2*k3.domega1 + k4.domega1);
    w2  += dt/6 * (k1.domega2 + 2*k2.domega2 + 2*k3.domega2 + k4.domega2);
}

function getVelocities() { // Расчет скоростей масс
    // Расчет скорости 1-й массы
    let v1x = l1 * Math.cos(fi1) * w1;
    let v1y = -l1 * Math.sin(fi1) * w1;

    // Расчет скорости 2-й массы
    let v2x = v1x + l2 * Math.cos(fi2) * w2;
    let v2y = v1y - l2 * Math.sin(fi2) * w2;

    return { v1x, v1y, v2x, v2y };
}

function calculateEnergies() {
    let { v1x, v1y, v2x, v2y } = getVelocities();
    let v1sq = v1x * v1x + v1y * v1y;
    let v2sq = v2x * v2x + v2y * v2y;
    let kinetic = 0.5 * m1 * v1sq + 0.5 * m2 * v2sq;
    
    let offset = g * 2 * (m1 + m2) * L_MAX;
    let potential = g * (m1 * (ORIGIN_Y - y1) + m2 * (ORIGIN_Y - y2)) + offset;

    let total = kinetic + potential;
    let max = Math.max(total, kinetic);

    return { kinetic, potential, total, max };
}

function drawEnergyPlots() {
    // Настраиваем слой
    energy_graphics.background(28, 33, 39, 255);
    energy_graphics.strokeWeight(2);
    energy_graphics.noFill();

    let x_step = (PLOT_W - 30) / (max_history - 1);
    let y_scale = (PLOT_H - 30) / energy_max;

    // Суммарная энергия (белая)
    energy_graphics.stroke(255, 255, 255);
    energy_graphics.beginShape();
    for (let i = 0; i < energy_history.length; i++) {
        let x = 20 + i * x_step;
        let y = PLOT_H - 20 - energy_history[i].total * y_scale;
        energy_graphics.vertex(x, y);
    }
    energy_graphics.endShape();

    // Кинетическая энергия (красная)
    energy_graphics.stroke(255, 100, 100);
    energy_graphics.beginShape();
    for (let i = 0; i < energy_history.length; i++) {
        let x = 20 + i * x_step;
        let y = PLOT_H - 20 - energy_history[i].kinetic * y_scale;
        energy_graphics.vertex(x, y);
    }
    energy_graphics.endShape();

    // Потенциальная энергия (синяя)
    energy_graphics.stroke(100, 150, 255);
    energy_graphics.beginShape();
    for (let i = 0; i < energy_history.length; i++) {
        let x = 20 + i * x_step;
        let y = PLOT_H - 20 - energy_history[i].potential * y_scale;
        energy_graphics.vertex(x, y);
    }
    energy_graphics.endShape();

    // Рисуем оси
    energy_graphics.stroke(100);
    energy_graphics.line(20, PLOT_H - 20, PLOT_W - 10, PLOT_H - 20); // Ось времени
    energy_graphics.line(20, 10, 20, PLOT_H - 20); // Ось энергии

    // Подписи
    energy_graphics.fill(255);
    energy_graphics.noStroke();
    energy_graphics.textSize(10);
    energy_graphics.text('Total', PLOT_W - 30, 20);
    energy_graphics.fill(100, 150, 255);
    energy_graphics.text('Potential', PLOT_W - 48, 35);
    energy_graphics.fill(255, 100, 100);
    energy_graphics.text('Kinetic', PLOT_W - 39, 50);
    energy_graphics.fill('white');
    energy_graphics.text('E', 7, 15);
    energy_graphics.text('T', PLOT_W - 15, PLOT_H - 7);

    // Выводим слой на основной холст
    image(energy_graphics, plot_x, plot_y);
}

function getTrailColor() { // Цвет траектории зависит от скорости
    let { v1x, v1y, v2x, v2y } = getVelocities();
    let v2sq = v2x * v2x + v2y * v2y;

    // Значение цвета
    if (g < 11) {return v2sq / 200;}
    else {return v2sq / g / 20;}
}

function settingsHandler() {
    // Показываем панель
    fi1_label.show();
    fi1_input.show();
    fi2_label.show();
    fi2_input.show();
    w1_label.show();
    w1_input.show();
    w2_label.show();
    w2_input.show();
    ok_button.show();
    cancel_button.show();

    // Прячем кнопку Settings
    settings_button.hide();
}

function applySettings() {
    // Считываем значения из полей
    let new_fi1 = parseFloat(fi1_input.value());
    let new_fi2 = parseFloat(fi2_input.value());
    let new_w1 = parseFloat(w1_input.value());
    let new_w2 = parseFloat(w2_input.value());

    // Если введено не число, оставляем старое значение
    if (!isNaN(new_fi1)) start_fi1 = new_fi1;
    if (!isNaN(new_fi2)) start_fi2 = new_fi2;
    if (!isNaN(new_w1)) start_w1 = new_w1;
    if (!isNaN(new_w2)) start_w2 = new_w2;

    restartSimulation();

    // Скрываем панель
    fi1_label.hide();
    fi1_input.hide();
    fi2_label.hide();
    fi2_input.hide();
    w1_label.hide();
    w1_input.hide();
    w2_label.hide();
    w2_input.hide();
    ok_button.hide();
    cancel_button.hide();

    // Показываем кнопку Settings
    settings_button.show();
}

function cancelSettings() {
    fi1_label.hide();
    fi1_input.hide();
    fi2_label.hide();
    fi2_input.hide();
    w1_label.hide();
    w1_input.hide();
    w2_label.hide();
    w2_input.hide();
    ok_button.hide();
    cancel_button.hide();

    settings_button.show();
}

function setup() { // Отрисовка интерфейса
    injectSliderCss();
    
    createCanvas(WIDTH, HEIGHT);

    plot_x = SETTINGS_WIDTH;
    plot_y = HEIGHT - PLOT_H;

    trail_graphics = createGraphics(SIMULATION_WINDOW_WIDTH, SIMULATION_WINDOW_HEIGHT);
    trail_graphics.clear();
    energy_graphics = createGraphics(PLOT_W, PLOT_H);
    settings_graphics = createGraphics(SETTINGS_WIDTH, HEIGHT);
    settings_graphics.clear();

    model_parametrs_title = createDiv("Model parameters");
    model_parametrs_title.addClass("section-title");

    trail_parametrs_title = createDiv("Trail");
    trail_parametrs_title.addClass("section-title");

    m1_slider = createSlider(0.1, 5, 1, 0.1);
    m2_slider = createSlider(0.1, 5, 1, 0.1);
    l1_slider = createSlider(0.1, L_MAX / 100, 1, 0.1);
    l2_slider = createSlider(0.1, L_MAX / 100, 1.5, 0.1);
    g_slider  = createSlider(0, 10, 1, 0.1);
    speed_slider = createSlider(0.1, 5.0, 1.0, 0.1);

    styleUiSlider(m1_slider);
    styleUiSlider(m2_slider);
    styleUiSlider(l1_slider);
    styleUiSlider(l2_slider);
    styleUiSlider(g_slider);
    styleUiSlider(speed_slider);

    m1_label = createDiv('Mass 1');
    m2_label = createDiv('Mass 2');
    l1_label = createDiv('Length 1');
    l2_label = createDiv('Length 2');
    g_label  = createDiv('Acceleration');
    speed_label  = createDiv('Speed');

    m1_value_tag = createDiv();
    m2_value_tag = createDiv();
    l1_value_tag = createDiv();
    l2_value_tag = createDiv();
    g_value_tag = createDiv();
    speed_value_tag = createDiv();

    styleUiLabel(m1_label);
    styleUiLabel(m2_label);
    styleUiLabel(l1_label);
    styleUiLabel(l2_label);
    styleUiLabel(g_label);
    styleUiLabel(speed_label);

    styleUiValueTag(m1_value_tag);
    styleUiValueTag(m2_value_tag);
    styleUiValueTag(l1_value_tag);
    styleUiValueTag(l2_value_tag);
    styleUiValueTag(g_value_tag);
    styleUiValueTag(speed_value_tag);

    divider_1 = createDiv();
    divider_2 = createDiv();
    divider_3 = createDiv();

    divider_1.addClass("section-divider");
    divider_2.addClass("section-divider");
    divider_3.addClass("section-divider");

    trail_clear_button = createButton('Clear trail');
    styleUiButtonTransparent(trail_clear_button, BTN_W, BTN_H);
    trail_clear_button.mousePressed(() => trail_graphics.clear());

    trail_checkbox = createCheckbox('Show trail', true);
    styleUiCheckbox(trail_checkbox);

    gradient_checkbox = createCheckbox('Gradient mode', true);
    styleUiCheckbox(gradient_checkbox);

    restart_button = createButton('Restart');
    styleUiButton(restart_button, BTN_W, BTN_H);
    restart_button.mousePressed(() => restartSimulation());

    pause_button = createButton('Pause');
    styleUiButtonAccent(pause_button, BTN_W, BTN_H);
    pause_button.mousePressed(() => {
        paused = !paused;
        pause_button.html(paused ? 'Resume' : 'Pause');
    });

    // Позже сделаю отрисовку, как для предыдущего блока
    let settings_x = 14;
    let settings_y = 655; 

    settings_button = createButton('Change start parametrs');
    styleUiButtonTransparent(settings_button);
    settings_button.style('text-align', 'left');
    settings_button.style('padding-left', '1px');
    settings_button.size(BTN_W + 20, BTN_H + 20);
    settings_button.position(settings_x - 3, settings_y);
    settings_button.mousePressed(settingsHandler);

    ok_button = createButton('OK');
    ok_button.position(settings_x + 3, settings_y + 120);
    ok_button.mousePressed(applySettings);
    ok_button.hide();

    cancel_button = createButton('Cancel');
    cancel_button.position(settings_x + 42, settings_y + 120);
    cancel_button.mousePressed(cancelSettings);
    cancel_button.hide();

    fi1_label = createDiv('fi1:');
    fi1_label.position(settings_x, settings_y);
    fi1_label.style('color', 'white');
    fi1_label.hide();

    fi1_input = createInput(start_fi1.toFixed(2));
    fi1_input.position(settings_x + 35, settings_y);
    fi1_input.size(60);
    fi1_input.hide();

    fi2_label = createDiv('fi2:');
    fi2_label.position(settings_x, settings_y + 30);
    fi2_label.style('color', 'white');
    fi2_label.hide();

    fi2_input = createInput(start_fi2.toFixed(2));
    fi2_input.position(settings_x + 35, settings_y + 30);
    fi2_input.size(60);
    fi2_input.hide();

    w1_label = createDiv('w1:');
    w1_label.position(settings_x, settings_y + 60);
    w1_label.style('color', 'white');
    w1_label.hide();

    w1_input = createInput(start_w1.toFixed(2));
    w1_input.position(settings_x + 35, settings_y + 60);
    w1_input.size(60);
    w1_input.hide();

    w2_label = createDiv('w2:');
    w2_label.position(settings_x, settings_y + 90);
    w2_label.style('color', 'white');
    w2_label.hide();

    w2_input = createInput(start_w2.toFixed(2));
    w2_input.position(settings_x + 35, settings_y + 90);
    w2_input.size(60);
    w2_input.hide();

    layoutSidebar();
}

function draw() {
    background(39, 42, 47, 255);
    settings_graphics.background(28, 33, 39, 255);
    image(settings_graphics, 0, 0);

    textFont('Inter');

    m1 = m1_slider.value();
    m2 = m2_slider.value();
    l1 = l1_slider.value() * 100;
    l2 = l2_slider.value() * 100;
    g = g_slider.value() * G;

    // Сохранение координат 2-й массы
    let ex_x2 = x2;
    let ex_y2 = y2;

    calculateCoordinates();

    // Отрисовка траектории движения
    if (gradient_checkbox.checked()) {
        let trail_colour = getTrailColor();
        trail_graphics.stroke(trail_colour * 16, trail_colour * 4, trail_colour, 255);}
    else {trail_graphics.stroke(255, 100, 0, 100);}
    trail_graphics.strokeWeight(1);
    trail_graphics.line(ex_x2 - SETTINGS_WIDTH, ex_y2, x2 - SETTINGS_WIDTH, y2); // траектория движения 2-й массы
    if (trail_checkbox.checked()) {image(trail_graphics, SETTINGS_WIDTH, 0);}

    // Отрисовка маятника
    stroke(120);
    line(ORIGIN_X, ORIGIN_Y, x1, y1);
    line(x1, y1, x2, y2);
    
    stroke(255);
    fill(255);
    circle(ORIGIN_X, ORIGIN_Y, 3);
    circle(x1, y1, Math.sqrt(m1) * 10);
    circle(x2, y2, Math.sqrt(m2) * 10);

    // Расчет и сохранение значений энергий
    let energies = calculateEnergies();
    energy_max = Math.max(energy_max, energies.max);
    energy_history.push(energies);
    if (energy_history.length > max_history) {
        let removed = energy_history.shift();
        if (removed.max >= energy_max) {
            energy_max = 0;
            for (let e of energy_history) {
                energy_max = Math.max(energy_max, e.max);
            }
        }
    }

    drawEnergyPlots();

    // Нахождение следующего состояния системы
    if (!paused) {
        const timeScale = Number(speed_slider.value());
        const subSteps = Math.ceil(timeScale);
        const dtStep = dt * timeScale / subSteps;

        for (let i = 0; i < subSteps; i++) {
            rk4(dtStep);
        }
    }
}