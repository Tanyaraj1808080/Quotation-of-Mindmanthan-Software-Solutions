document.addEventListener('DOMContentLoaded', function() {

    // Function to load the sidebar content
    async function loadSidebar() {
        const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
        if (!sidebarPlaceholder) return;

        try {
            const response = await fetch('sidebar.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const sidebarHtml = await response.text();
            sidebarPlaceholder.innerHTML = sidebarHtml;
            initializeSidebarInteractivity(); // Initialize interactivity after loading
        } catch (error) {
            console.error('Failed to load sidebar:', error);
            sidebarPlaceholder.innerHTML = '<p>Error loading sidebar.</p>';
        }
    }

    // Function to initialize all sidebar interactivity (moved here)
    function initializeSidebarInteractivity() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) {
            console.error("Sidebar element not found after loading.");
            return;
        }

        const navLinks = sidebar.querySelectorAll('.nav-link');
        const mainContent = document.querySelector('.main-content'); // Assuming main content exists

        // Function to set active link
        function setActiveLink(linkElement) {
            // Remove 'active' from all links
            navLinks.forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            });

            // Add 'active' to the clicked link
            linkElement.classList.add('active');
            linkElement.setAttribute('aria-current', 'page');

            // If it's a child link, ensure its parent dropdown is also marked active
            let parentCollapse = linkElement.closest('.collapse');
            if (parentCollapse) {
                let parentDropdownToggle = sidebar.querySelector(`a[href="#${parentCollapse.id}"]`);
                if (parentDropdownToggle) {
                    parentDropdownToggle.classList.add('active');
                    // Ensure parent dropdown is open if a child is active
                    if (!parentCollapse.classList.contains('show')) {
                        new bootstrap.Collapse(parentCollapse, { toggle: true });
                    }
                }
            }

            // Save active link to localStorage
            localStorage.setItem('activeNavLink', linkElement.dataset.navId);
        }

        // Determine current page and set active link
        const currentPage = window.location.pathname.split('/').pop(); // e.g., "index.html"
        let activeLinkFound = false;

        // Try to find a link that directly matches the current page
        navLinks.forEach(link => {
            if (link.href && link.href.endsWith(currentPage)) {
                setActiveLink(link);
                activeLinkFound = true;
            }
        });

        // If no direct match, try to use localStorage (might be useful for sub-items without direct page links)
        if (!activeLinkFound) {
            const savedActiveLink = localStorage.getItem('activeNavLink');
            if (savedActiveLink) {
                const activeLinkElement = sidebar.querySelector(`[data-nav-id="${savedActiveLink}"]`);
                if (activeLinkElement) {
                    setActiveLink(activeLinkElement);
                    activeLinkFound = true;
                }
            }
        }

        // Default to 'Dashboard' if no active link found (e.g., first visit)
        if (!activeLinkFound) {
            const dashboardLink = sidebar.querySelector('[data-nav-id="dashboard"]');
            if (dashboardLink) {
                setActiveLink(dashboardLink);
            }
        }


        // Add click event listeners to all nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                // Prevent default for dropdown toggles
                if (this.hasAttribute('data-bs-toggle') && this.getAttribute('data-bs-toggle') === 'collapse') {
                    // If the clicked item is a dropdown toggle, only make it active, don't collapse others
                    // The collapse behavior is handled by Bootstrap itself
                    setActiveLink(this); // Mark the parent dropdown as active
                } else {
                    // For regular links, handle navigation (if not already handled by href)
                    setActiveLink(this);
                }
            });
        });

        // Handle logout functionality
        const sidebarLogoutLink = document.getElementById('sidebar-logout-link');
        // NOTE: navbarLogoutLink is in the main content, not in the sidebar. Its event listener
        // is attached later in the main DOMContentLoaded.

        function handleLogout(event) {
            event.preventDefault();
            alert('Logout functionality would be implemented here!');
            console.log('User attempted to log out.');
        }

        if (sidebarLogoutLink) {
            sidebarLogoutLink.addEventListener('click', handleLogout);
        }


        // --- Collapsible Sidebar Sections (custom ones, not Bootstrap) ---
        // This part needs to be re-run after sidebar is loaded.

        // Custom toggle for individual LIs within a collapsible section
        function toggleContentItems(items, isOpening) {
            items.forEach(item => {
                if (isOpening) {
                    item.style.display = 'block'; // Make it visible for height calculation
                    const height = item.scrollHeight + 'px'; // Get natural height
                    item.style.maxHeight = '0'; // Start from 0 for animation
                    item.style.overflow = 'hidden';
                    item.style.transition = 'max-height 0.3s ease-out, opacity 0.3s ease-out';
                    item.style.opacity = '0';
                    // Trigger reflow to ensure initial state is applied before transition
                    item.offsetHeight;
                    item.style.maxHeight = height;
                    item.style.opacity = '1';
                } else {
                    item.style.maxHeight = item.scrollHeight + 'px'; // Set current height
                    item.style.opacity = '1';
                    item.style.transition = 'max-height 0.3s ease-out, opacity 0.3s ease-out';
                    // Trigger reflow
                    item.offsetHeight;
                    item.style.maxHeight = '0';
                    item.style.opacity = '0';
                    item.addEventListener('transitionend', function handler() {
                        item.style.display = 'none';
                        item.style.removeProperty('max-height');
                        item.style.removeProperty('overflow');
                        item.style.removeProperty('transition');
                        item.style.removeProperty('opacity');
                        item.removeEventListener('transitionend', handler);
                    }, { once: true });
                }
            });
        }

        const collapsibleHeaders = sidebar.querySelectorAll('.collapsible-header'); // IMPORTANT: query from `sidebar`
        const collapsibleSectionsData = [];

        collapsibleHeaders.forEach(header => {
            const arrow = header.querySelector('.toggle-arrow');
            const contentItems = [];
            let nextSibling = header.nextElementSibling;

            while (nextSibling && !nextSibling.classList.contains('sidebar-heading')) {
                contentItems.push(nextSibling);
                nextSibling = nextSibling.nextElementSibling;
            }

            collapsibleSectionsData.push({
                header: header,
                arrow: arrow,
                content: contentItems,
                isOpen: false
            });

            // Initially hide all content items associated with these headers
            contentItems.forEach(item => {
                item.style.maxHeight = '0';
                item.style.overflow = 'hidden';
                item.style.display = 'none';
                item.style.opacity = '0';
                item.style.transition = 'max-height 0.3s ease-out, opacity 0.3s ease-out';
            });

            header.addEventListener('click', function() {
                const currentSection = collapsibleSectionsData.find(section => section.header === header);

                collapsibleSectionsData.forEach(section => {
                    if (section !== currentSection && section.isOpen) {
                        section.header.classList.remove('open');
                        if (section.arrow) section.arrow.classList.remove('open');
                        toggleContentItems(section.content, false); // Close other open sections
                        section.isOpen = false;
                    }
                });

                currentSection.isOpen = !currentSection.isOpen;
                currentSection.header.classList.toggle('open', currentSection.isOpen);
                if (currentSection.arrow) currentSection.arrow.classList.toggle('open', currentSection.isOpen);

                toggleContentItems(currentSection.content, currentSection.isOpen); // Toggle clicked section
            });
        });

        // Reinitialize Bootstrap collapse functionality for dynamically loaded content
        const collapseElements = sidebar.querySelectorAll('.collapse');
        collapseElements.forEach(function (collapseEl) {
            new bootstrap.Collapse(collapseEl, { toggle: false });
        });
    }

    // Call loadSidebar on DOMContentLoaded
    loadSidebar();

    // --- Chart.js Initialization (remains outside initializeSidebarInteractivity) ---
    // These charts are specific to index.html and should only run if their canvases exist.
    // If other pages have charts, this logic might need to be encapsulated as well.

    const quotationTrendCtx = document.getElementById('quotationTrendChart');
    if (quotationTrendCtx) {
        new Chart(quotationTrendCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Quotations',
                    data: [10, 15, 8, 20, 12, 25],
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#0d6efd',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#0d6efd'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Monthly Quotation Trend',
                        font: {
                            size: 16
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e9ecef'
                        }
                    }
                }
            }
        });
    }

    const statusRatioCtx = document.getElementById('statusRatioChart');
    if (statusRatioCtx) {
        new Chart(statusRatioCtx, {
            type: 'doughnut',
            data: {
                labels: ['Approved', 'Pending', 'Rejected'],
                datasets: [{
                    label: 'Quotation Status',
                    data: [12, 7, 5],
                    backgroundColor: [
                        '#198754',
                        '#ffc107',
                        '#dc3545'
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 20,
                            padding: 15
                        }
                    },
                    title: {
                        display: true,
                        text: 'Quotation Status Ratio',
                        font: {
                            size: 16
                        }
                    }
                }
            }
        });
    }

    const salesTrendCtx = document.getElementById('salesTrendChart');
    if (salesTrendCtx) {
        new Chart(salesTrendCtx, {
            type: 'line',
            data: {
                labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
                datasets: [{
                    label: 'Monthly Sales',
                    data: [30000, 35000, 28000, 40000, 32000, 45000], // Example data
                    borderColor: '#198754', // Green
                    backgroundColor: 'rgba(25, 135, 84, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#198754',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#198754'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Monthly Sales Trend',
                        font: {
                            size: 16
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e9ecef'
                        }
                    }
                }
            }
        });
    }

    const clientAcquisitionCtx = document.getElementById('clientAcquisitionChart');
    if (clientAcquisitionCtx) {
        new Chart(clientAcquisitionCtx, {
            type: 'bar',
            data: {
                labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
                datasets: [{
                    label: 'New Clients',
                    data: [5, 7, 6, 8, 10, 12], // Example data
                    backgroundColor: '#0dcaf0', // Bootstrap info blue
                    borderColor: '#0dcaf0',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Monthly Client Acquisition',
                        font: {
                            size: 16
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e9ecef'
                        },
                        ticks: {
                            precision: 0 // Ensure whole numbers for client count
                        }
                    }
                }
            }
        });
    }



    const salesPerformanceCtx = document.getElementById('salesPerformanceChart');
    if (salesPerformanceCtx) {
        new Chart(salesPerformanceCtx, {
            type: 'bar', // Example chart type
            data: {
                labels: ['Product A', 'Product B', 'Product C', 'Product D'],
                datasets: [{
                    label: 'Revenue by Product',
                    data: [120000, 90000, 75000, 60000],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Revenue by Product Category',
                        font: {
                            size: 16
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e9ecef'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    // The navbar logout link listener can stay here as it's part of the static HTML structure
    const navbarLogoutLink = document.getElementById('navbar-logout-link');
    function handleLogout(event) {
        event.preventDefault();
        alert('Logout functionality would be implemented here!');
        console.log('User attempted to log out.');
    }
    if (navbarLogoutLink) {
        navbarLogoutLink.addEventListener('click', handleLogout);
    }

    // --- New Feature: Export Table to CSV ---
    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            const table = document.querySelector('.table'); // Find the table to export
            if (!table) {
                console.error("Could not find the table to export.");
                return;
            }
            exportTableToCSV(table, 'quotations-export.csv');
        });
    }

    function exportTableToCSV(table, filename) {
        const rows = table.querySelectorAll('tr');
        let csv = [];
        
        // Process header row, skipping the last cell ('Actions')
        const headers = rows[0].querySelectorAll('th');
        let headerRow = [];
        for (let i = 0; i < headers.length - 1; i++) { // Stop before the last header
            headerRow.push(`"${headers[i].innerText.replace(/"/g, '""')}"`);
        }
        csv.push(headerRow.join(','));

        // Process data rows, skipping the last cell ('Actions')
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const cols = row.querySelectorAll('td');
            let rowData = [];
            for (let j = 0; j < cols.length - 1; j++) { // Stop before the last cell
                // For the 'Status' column, get the text from the span inside
                let cellText = cols[j].innerText;
                if (cols[j].querySelector('.badge')) {
                    cellText = cols[j].querySelector('.badge').innerText;
                }
                rowData.push(`"${cellText.replace(/"/g, '""')}"`);
            }
            csv.push(rowData.join(','));
        }

        // Trigger download
        downloadCSV(csv.join('\n'), filename);
    }

    function downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) { // Feature detection
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // --- New Feature: Generate PDF from Table Row ---
    const pdfButtons = document.querySelectorAll('.download-pdf-btn');
    if (pdfButtons.length > 0) {
        pdfButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Find the parent table row to get the data from
                const tableRow = this.closest('tr');
                if (!tableRow) return;

                // Extract data from the table cells
                const quotationId = tableRow.cells[0].innerText;
                const clientName = tableRow.cells[1].innerText;
                const totalValue = tableRow.cells[2].innerText;
                const dateCreated = tableRow.cells[3].innerText;
                
                // Get the PDF template element
                const pdfTemplate = document.getElementById('quotation-pdf-template');
                if (!pdfTemplate) {
                    console.error("PDF template not found!");
                    return;
                }

                // Populate the template with the data
                pdfTemplate.querySelector('#pdf-quotation-id').innerText = quotationId;
                pdfTemplate.querySelector('#pdf-item-id').innerText = quotationId;
                pdfTemplate.querySelector('#pdf-date').innerText = dateCreated;
                pdfTemplate.querySelector('#pdf-client-name').innerText = clientName;
                pdfTemplate.querySelector('#pdf-total-value').innerText = totalValue;
                pdfTemplate.querySelector('#pdf-grand-total').innerText = totalValue;

                // Configure html2pdf
                const options = {
                    margin: 0.5,
                    filename: `Quotation-${quotationId}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                };

                // Generate and download the PDF
                html2pdf().from(pdfTemplate).set(options).save();
            });
        });
    }
});