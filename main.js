// Курсовая работа на тему "Симуляция двойного маятника"

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
const max_history = 500; // Кол-во точек на графике зависимости энергии от времени

const dt = 0.05; // Точность симуляции

// Интерфейс
const simulation_window_size = 1000; // Размер окна с симуляцией
const settings_width = 300; // Ширина блока настроек
const plot_h = 200; // Высота графика зависимости энергии от времени
const plot_w = simulation_window_size; // Ширина графика
const width = simulation_window_size + settings_width; // Ширина окна
const height = simulation_window_size + plot_h; // Высота окна
const origin_x = simulation_window_size / 2 + settings_width; // Координата X точки подвеса
const origin_y = simulation_window_size / 2; // Координата Y точки подвеса
const l_max = Math.min(height - origin_y, width - origin_x) / 2; // Максимальная длина плеча маятника
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


function calculateCoordinates() { // Вычисление координат масс
    x1 = origin_x + l1 * Math.sin(fi1);
    y1 = origin_y + l1 * Math.cos(fi1);
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
    let potential = g * (m1 * (origin_y - y1) + m2 * (origin_y - y2) + 2 * (m1 + m2)*l_max);

    return { kinetic, potential };
}

function drawEnergyPlots() {
    // Настраиваем слой
    energy_graphics.background(28, 33, 39, 255);
    energy_graphics.strokeWeight(2);
    energy_graphics.noFill();

    let energy_max = 0;
    for (let e of energy_history) {
        energy_max = Math.max(energy_max, e.kinetic, e.potential, e.kinetic + e.potential);
    }

    // Суммарная энергия (белая)
    energy_graphics.stroke(255, 255, 255);
    energy_graphics.beginShape();
    for (let i = 0; i < energy_history.length; i++) {
        let x = map(i, 0, max_history - 1, 20, plot_w - 10);
        let y = map(energy_history[i].kinetic + energy_history[i].potential, 0, energy_max, plot_h - 20, 10);
        energy_graphics.vertex(x, y);
    }
    energy_graphics.endShape();

    // Кинетическая энергия (красная)
    energy_graphics.stroke(255, 100, 100);
    energy_graphics.beginShape();
    for (let i = 0; i < energy_history.length; i++) {
        let x = map(i, 0, max_history - 1, 20, plot_w - 10);
        let y = map(energy_history[i].kinetic, 0, energy_max, plot_h - 20, 10);
        energy_graphics.vertex(x, y);
    }
    energy_graphics.endShape();

    // Потенциальная энергия (синяя)
    energy_graphics.stroke(100, 150, 255);
    energy_graphics.beginShape();
    for (let i = 0; i < energy_history.length; i++) {
        let x = map(i, 0, max_history - 1, 20, plot_w - 10);
        let y = map(energy_history[i].potential, 0, energy_max, plot_h - 20, 10);
        energy_graphics.vertex(x, y);
    }
    energy_graphics.endShape();

    // Рисуем оси
    energy_graphics.stroke(100);
    energy_graphics.line(20, plot_h - 20, plot_w - 10, plot_h - 20); // Ось времени
    energy_graphics.line(20, 10, 20, plot_h - 20); // Ось энергии

    // Подписи
    energy_graphics.fill(255);
    energy_graphics.noStroke();
    energy_graphics.textSize(10);
    energy_graphics.text('All', plot_w - 20, 20);
    energy_graphics.fill(100, 150, 255);
    energy_graphics.text('Potential', plot_w - 48, 35);
    energy_graphics.fill(255, 100, 100);
    energy_graphics.text('Kinetic', plot_w - 39, 50);
    energy_graphics.fill('white');
    energy_graphics.text('E', 7, 15);
    energy_graphics.text('T', plot_w - 15, plot_h - 7);

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
    // Координаты блока с параметрами симуляции
    let parametres_x = 20;
    let parametres_y = 20;

    plot_x = settings_width;
    plot_y = height - plot_h;

    createCanvas(width, height);
    trail_graphics = createGraphics(width, height);
    trail_graphics.clear();
    energy_graphics = createGraphics(plot_w, plot_h);
    settings_graphics = createGraphics(settings_width, height);
    settings_graphics.clear();

    // Создание слайдеров (ползунков)
    m1_slider = createSlider(10, 500, 100, 10); // (min, max, initial, step)
    m2_slider = createSlider(10, 500, 100, 10);
    l1_slider = createSlider(10, l_max, 100, 10);
    l2_slider = createSlider(10, l_max, 150, 10);
    g_slider = createSlider(0, 100, 10, 1);

    // Размещение слайдеров
    m1_slider.position(parametres_x, parametres_y);
    m2_slider.position(parametres_x, parametres_y + 25);
    l1_slider.position(parametres_x, parametres_y + 50);
    l2_slider.position(parametres_x, parametres_y + 75);
    g_slider.position(parametres_x, parametres_y + 100);

    // Подписи для слайдеров
    let m1_label = createDiv('Mass 1: ' + m1_slider.value());
    m1_label.position(parametres_x + 170, parametres_y + 2);
    m1_slider.input(() => m1_label.html('Mass 1: ' + m1_slider.value()));
    m1_label.style('color', 'white');

    let m2_label = createDiv('Mass 2: ' + m2_slider.value());
    m2_label.position(parametres_x + 170, parametres_y + 27);
    m2_slider.input(() => m2_label.html('Mass 2: ' + m2_slider.value()));
    m2_label.style('color', 'white');

    let l1_label = createDiv('Length 1: ' + l1_slider.value());
    l1_label.position(parametres_x + 170, parametres_y + 52);
    l1_slider.input(() => l1_label.html('Length 1: ' + l1_slider.value()));
    l1_label.style('color', 'white');

    let l2_label = createDiv('Length 2: ' + l2_slider.value());
    l2_label.position(parametres_x + 170, parametres_y + 77);
    l2_slider.input(() => l2_label.html('Length 2: ' + l2_slider.value()));
    l2_label.style('color', 'white');

    let g_label = createDiv('g: ' + g_slider.value());
    g_label.position(parametres_x + 170, parametres_y + 102);
    g_slider.input(() => g_label.html('g: ' + g_slider.value()));
    g_label.style('color', 'white');

    // Кнопка для удаления траектории движения
    let trail_clear_button = createButton('Clear trail');
    trail_clear_button.position(parametres_x + 2, parametres_y + 135);
    trail_clear_button.mousePressed(() => {trail_graphics.clear();});

    // Кнопка для возврата системы в начальное положение
    let restart_button = createButton('Restart');
    restart_button.position(parametres_x + 82, parametres_y + 135);
    restart_button.mousePressed(() => {
        restartSimulation();
    });

    // Кнопка паузы
    let pause_button = createButton('Pause');
    pause_button.position(parametres_x + 147, parametres_y + 135);
    pause_button.mousePressed(() => {
        paused = !paused;
        pause_button.html(paused ? 'Resume' : 'Pause');
    });

    // Координаты блока с настройками симуляции
    let settings_x = width - 70;
    let settings_y = 20;

    // Кнопка настроек
    settings_button = createButton('Settings');
    settings_button.position(width - 62, 20);
    settings_button.mousePressed(settingsHandler);

    // Кнопка "OK"
    ok_button = createButton('OK');
    ok_button.position(settings_x - 20, settings_y + 120);
    ok_button.mousePressed(applySettings);
    ok_button.hide();

    // Кнопка отмены изменений
    cancel_button = createButton('Cancel');
    cancel_button.position(settings_x + 18, settings_y + 120)
    cancel_button.mousePressed(cancelSettings);
    cancel_button.hide();

    // Поля ввода и подписи к ним
    fi1_label = createDiv('fi1:');
    fi1_label.position(settings_x - 30, settings_y);
    fi1_label.style('color', 'white');
    fi1_label.hide();

    fi1_input = createInput(start_fi1.toFixed(2));
    fi1_input.position(settings_x, settings_y);
    fi1_input.size(60);
    fi1_input.hide();

    fi2_label = createDiv('fi2:');
    fi2_label.position(settings_x - 30, settings_y + 30);
    fi2_label.style('color', 'white');
    fi2_label.hide();

    fi2_input = createInput(start_fi2.toFixed(2));
    fi2_input.position(settings_x, settings_y + 30);
    fi2_input.size(60);
    fi2_input.hide();

    w1_label = createDiv('w1:');
    w1_label.position(settings_x - 30, settings_y + 60);
    w1_label.style('color', 'white');
    w1_label.hide();

    w1_input = createInput(start_w1.toString());
    w1_input.position(settings_x, settings_y + 60);
    w1_input.size(60);
    w1_input.hide();

    w2_label = createDiv('w2:');
    w2_label.position(settings_x - 30, settings_y + 90);
    w2_label.style('color', 'white');
    w2_label.hide();

    w2_input = createInput(start_w2.toString());
    w2_input.position(settings_x, settings_y + 90);
    w2_input.size(60);
    w2_input.hide();

    // Создание галочки для отрисовки траектории движения
    trail_checkbox = createCheckbox('Show trail', true);
    trail_checkbox.position(parametres_x - 2, parametres_y + 165);
    trail_checkbox.style('color', 'white');

    // Создание галочки жерима с траекторией, характеризующей скорость массы
    gradient_checkbox = createCheckbox('Gradient mode', true);
    gradient_checkbox.position(parametres_x + 95, parametres_y + 165);
    gradient_checkbox.style('color', 'white');

    calculateCoordinates();
}

function draw() {
    background(34, 37, 42);
    settings_graphics.background(28, 33, 39, 255);
    image(settings_graphics, 0, 0);

    m1 = m1_slider.value();
    m2 = m2_slider.value();
    l1 = l1_slider.value();
    l2 = l2_slider.value();
    g = g_slider.value();

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
    trail_graphics.line(ex_x2, ex_y2, x2, y2); // траектория движения 2-й массы
    if (trail_checkbox.checked()) {image(trail_graphics, 0, 0);}

    // Отрисовка маятника
    stroke(0);
    line(origin_x, origin_y, x1, y1);
    line(x1, y1, x2, y2);

    fill(255);
    circle(x1, y1, Math.sqrt(m1));
    circle(x2, y2, Math.sqrt(m2));

    // Расчет и сохранение значений энергий
    let energies = calculateEnergies();
    energy_history.push(energies);
    if (energy_history.length > max_history) {energy_history.shift();}

    drawEnergyPlots();

    // Нахождение следующего состояния системы
    if (!paused) {rk4(dt);}
}