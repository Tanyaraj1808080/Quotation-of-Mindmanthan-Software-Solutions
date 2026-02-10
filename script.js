document.addEventListener('DOMContentLoaded', function() {
    // --- Sidebar Interactivity ---
    const sidebar = document.getElementById('sidebar');
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
            }
        }

        // Save active link to localStorage
        localStorage.setItem('activeNavLink', linkElement.dataset.navId);
    }

    // Initialize active state based on localStorage or default to Dashboard
    const savedActiveLink = localStorage.getItem('activeNavLink');
    if (savedActiveLink) {
        const activeLinkElement = sidebar.querySelector(`[data-nav-id="${savedActiveLink}"]`);
        if (activeLinkElement) {
            setActiveLink(activeLinkElement);
            // If it's a child link, ensure its parent submenu is open
            let parentCollapse = activeLinkElement.closest('.collapse');
            if (parentCollapse && !parentCollapse.classList.contains('show')) {
                new bootstrap.Collapse(parentCollapse, { toggle: true });
            }
        }
    } else {
        // Default to 'Dashboard' if no saved active link
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
                setActiveLink(this);
            }
        });
    });

    // Handle logout functionality
    const sidebarLogoutLink = document.getElementById('sidebar-logout-link');
    const navbarLogoutLink = document.getElementById('navbar-logout-link');

    function handleLogout(event) {
        event.preventDefault();
        // In a real application, this would involve:
        // 1. Making an API call to log out the user on the server
        // 2. Clearing local storage/cookies (e.g., localStorage.removeItem('authToken'))
        // 3. Redirecting to the login page
        alert('Logout functionality would be implemented here!');
        console.log('User attempted to log out.');
        // Example redirect (uncomment and modify in a real app):
        // window.location.href = '/login.html';
    }

    if (sidebarLogoutLink) {
        sidebarLogoutLink.addEventListener('click', handleLogout);
    }
    if (navbarLogoutLink) {
        navbarLogoutLink.addEventListener('click', handleLogout);
    }

    // Basic responsiveness toggle (if needed, this would depend on a button in the main content)
    // For now, assuming sidebar is always visible on larger screens
    // To implement a toggle, you'd need a button, e.g.:
    // const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    // if (sidebarToggleBtn) {
    //     sidebar.classList.toggle('active');
    //     mainContent.classList.toggle('active');
    // });
    // }


    // --- Chart.js Initialization ---

    // --- Quotation Trend Chart (Line Chart) ---
    const quotationTrendCtx = document.getElementById('quotationTrendChart');
    if (quotationTrendCtx) {
        new Chart(quotationTrendCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Quotations',
                    data: [10, 15, 8, 20, 12, 25], // Example data
                    borderColor: '#0d6efd', // Blue professional color
                    backgroundColor: 'rgba(13, 110, 253, 0.2)',
                    fill: true,
                    tension: 0.4, // Smooth curve
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
                        display: false // No legend for a single line
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

    // --- Quotation Status Ratio (Doughnut Chart) ---
    const statusRatioCtx = document.getElementById('statusRatioChart');
    if (statusRatioCtx) {
        new Chart(statusRatioCtx, {
            type: 'doughnut',
            data: {
                labels: ['Approved', 'Pending', 'Rejected'],
                datasets: [{
                    label: 'Quotation Status',
                    data: [12, 7, 5], // Example data
                    backgroundColor: [
                        '#198754', // Green for Approved
                        '#ffc107', // Yellow for Pending
                        '#dc3545'  // Red for Rejected
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom', // Legend at bottom
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
});