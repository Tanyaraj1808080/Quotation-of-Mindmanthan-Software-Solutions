# Project Report: Quotation Management System

## 1. Project Overview

This project is a web-based Quotation Management System designed to streamline the process of creating, managing, and tracking quotations, clients, and invoices. It provides a user-friendly interface with a dashboard for quick insights and various modules for detailed management.

## 2. Technology Stack

The application is built using a combination of modern web technologies:

*   **Backend:**
    *   **Node.js:** A JavaScript runtime environment for executing server-side code.
    *   **Express.js:** A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
    *   **CORS:** A Node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.

*   **Frontend:**
    *   **HTML:** The standard markup language for creating web pages.
    *   **CSS:** A stylesheet language used to describe the presentation of a document written in a markup language like HTML.
    *   **JavaScript:** A programming language that enables interactive web pages.
    *   **Bootstrap:** A popular CSS framework for developing responsive and mobile-first websites.
    *   **Chart.js:** A simple yet flexible JavaScript charting for designers & developers.
    *   **html2pdf.js:** A JavaScript library to generate PDFs from HTML.

*   **Database:**
    *   **JSON file (`db.json`):** A simple file-based database used for storing application data. This is suitable for development and small-scale applications.

## 3. Features

The application includes the following features:

*   **Dashboard:** A central dashboard (`index.html`) that provides a high-level overview of key metrics through Key Performance Indicator (KPI) cards and charts. This includes:
    *   Total, approved, pending, and rejected quotations.
    *   Total quotation value and approval rate.
    *   Charts for quotation trends and status ratios.

*   **Quotation Management:**
    *   View all quotations (`all-quotations.html`).
    *   Create new quotations (`create-quotation.html`).
    *   View quotation details (`quotation-details.html`).
    *   Approve, reject, and manage the status of quotations.
    *   Export quotations to CSV and PDF.

*   **Client Management:**
    *   View all clients (`clients.html`).
    *   View client details (`client-details.html`).

*   **Invoice Management:**
    *   View all invoices (`invoices.html`).
    *   Create new invoices (`create-invoice.html`).
    *   View invoice details (`invoice-details.html`).

*   **Reporting:**
    *   Various report pages for sales performance, monthly quotations, etc.

*   **Usability Features:**
    *   A responsive sidebar for navigation (`sidebar.html`).
    *   A global search functionality.
    *   Notifications for important events.
    *   A clean and modern user interface.

## 4. File Structure

The project is organized into the following key files and directories:

*   `server.js`: The heart of the backend, this file sets up the Express server, defines the API endpoints for CRUD operations on quotations, clients, and invoices, and serves the static frontend files.
*   `script.js`: This file contains the majority of the frontend JavaScript logic. It handles dynamic content loading, API interactions, chart initialization, and other interactive features.
*   `style.css`: The main stylesheet that defines the look and feel of the application.
*   `index.html`: The main entry point of the application, which serves as the dashboard.
*   **HTML Files (`*.html`):** A collection of HTML files, each representing a different page or view within the application (e.g., `all-quotations.html`, `clients.html`, `create-invoice.html`).
*   `db.json`: A simple JSON file used to store the application's data, including quotations, clients, and invoices.
*   `package.json`: This file lists the project's dependencies (Express and CORS) and defines the `start` script to run the server.

## 5. How to Run the Application

To run the application, you need to have Node.js installed.

1.  Open a terminal in the project directory.
2.  Run `npm install` to install the dependencies.
3.  Run `npm start` to start the server.
4.  Open a web browser and navigate to `http://localhost:3000`.

This will launch the application, and you should see the main dashboard.
