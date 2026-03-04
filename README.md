# Double Pendulum Simulation

A browser-based simulation of a **double pendulum** demonstrating
chaotic motion and energy dynamics.\
The simulation is written in **JavaScript using p5.js** and runs
entirely in the browser.

🌐 **Live demo:**\
https://teafoon.github.io/double-pendulum/

------------------------------------------------------------------------

## About

The double pendulum is a classic example of a **chaotic system**.\
Even small differences in initial conditions can lead to dramatically
different motion over time.

This project simulates the system using numerical integration and
visualizes:

-   pendulum motion
-   trajectory of the second mass
-   energy of the system over time

------------------------------------------------------------------------

## Features

-   Real-time double pendulum simulation
-   Adjustable physical parameters:
    -   masses
    -   rod lengths
    -   initial angles
    -   initial angular velocities
-   Simulation speed control
-   User-friendly interface
-   Energy plot (kinetic, potential, total)
-   Trajectory trail visualization
-   Automatic layout resizing when the browser window changes size

------------------------------------------------------------------------

## Implementation

The simulation uses:

-   **p5.js** for rendering
-   **Runge--Kutta 4th order (RK4)** for numerical integration
-   fixed timestep simulation
-   energy tracking for verification of physical correctness

------------------------------------------------------------------------

## Project Structure

    double-pendulum
    ├── index.html
    ├── main.js
    └── p5.min.js

------------------------------------------------------------------------

## Running Locally

You can run the simulation by simply opening:

    index.html

in your browser.

No build step or server is required.

------------------------------------------------------------------------

# Русская версия

## Симуляция двойного маятника

Браузерная симуляция **двойного маятника**, демонстрирующая хаотическое
движение и изменение энергии системы.\
Симуляция написана на **JavaScript с использованием p5.js** и полностью
работает в браузере.

🌐 **Демо:**\
https://teafoon.github.io/double-pendulum/

------------------------------------------------------------------------

## О проекте

Двойной маятник --- классический пример **хаотической системы**.\
Даже небольшие изменения начальных условий могут привести к совершенно
разным траекториям движения.

Проект моделирует систему с помощью численного интегрирования и
отображает:

-   движение маятника
-   траекторию второго груза
-   энергию системы во времени

------------------------------------------------------------------------

## Возможности

-   Симуляция двойного маятника в реальном времени
-   Настройка физических параметров:
    -   массы
    -   длины стержней
    -   начальные углы
    -   начальные угловые скорости
-   Регулировка скорости симуляции
-   Удобный пользовательский интерфейс
-   График энергии (кинетическая, потенциальная, полная)
-   Отображение траектории движения
-   Автоматическая адаптация интерфейса при изменении размера окна

------------------------------------------------------------------------

## Запуск

Чтобы запустить симуляцию локально, просто откройте файл:

    index.html

в браузере.

Сервер или сборка проекта не требуются.

------------------------------------------------------------------------

## License

MIT License
