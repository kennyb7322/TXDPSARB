// TXDPS ARB Form Application Logic
// Handles form navigation, branching logic, breadcrumbs, progress tracking, and exports

(function() {
    'use strict';

    // State management
    let formData = {};
    let questions = [];
    let currentSection = 0;
    let currentQuestionIndex = 0;

    // DOM elements
    const formContainer = document.getElementById('form-container');
    const breadcrumbs = document.getElementById('breadcrumbs');
    const progressFill = document.getElementById('progress-fill');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const dashboard = document.getElementById('dashboard');
    const helpModal = document.getElementById('help-modal');
    const helpBtn = document.getElementById('help-btn');

    // Initialize the application
    async function init() {
        try {
            await loadQuestions();
            setupEventListeners();
            renderCurrentQuestion();
            updateBreadcrumbs();
            updateProgress();
        } catch (error) {
            console.error('Error initializing form:', error);
            showError('Failed to load form. Please refresh the page.');
        }
    }

    // Load questions from JSON file
    async function loadQuestions() {
        try {
            const response = await fetch('questions.json');
            questions = await response.json();
        } catch (error) {
            console.error('Error loading questions:', error);
            throw error;
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        prevBtn.addEventListener('click', handlePrevious);
        nextBtn.addEventListener('click', handleNext);
        submitBtn.addEventListener('click', handleSubmit);
        helpBtn.addEventListener('click', showHelp);

        // Export buttons
        document.getElementById('export-pdf').addEventListener('click', exportAsPDF);
        document.getElementById('export-excel').addEventListener('click', exportAsExcel);
        document.getElementById('export-json').addEventListener('click', exportAsJSON);

        // Modal close
        const closeBtn = helpModal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            helpModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.style.display = 'none';
            }
        });
    }

    // Render current question
    function renderCurrentQuestion() {
        if (!questions[currentQuestionIndex]) {
            console.error('Question not found at index:', currentQuestionIndex);
            return;
        }

        const question = questions[currentQuestionIndex];
        formContainer.innerHTML = '';

        const questionGroup = document.createElement('div');
        questionGroup.className = 'question-group';

        const label = document.createElement('label');
        label.className = 'question-label';
        label.textContent = question.label;
        label.htmlFor = question.id;

        if (question.required) {
            const required = document.createElement('span');
            required.textContent = ' *';
            required.style.color = 'var(--danger-color)';
            label.appendChild(required);
        }

        questionGroup.appendChild(label);

        if (question.help) {
            const help = document.createElement('div');
            help.className = 'question-help';
            help.textContent = question.help;
            questionGroup.appendChild(help);
        }

        const input = createInput(question);
        questionGroup.appendChild(input);

        formContainer.appendChild(questionGroup);

        // Update navigation buttons
        prevBtn.disabled = currentQuestionIndex === 0;
        
        if (currentQuestionIndex === questions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            submitBtn.style.display = 'none';
        }
    }

    // Create input element based on question type
    function createInput(question) {
        let input;
        const savedValue = formData[question.id] || '';

        switch (question.type) {
            case 'text':
            case 'email':
            case 'date':
                input = document.createElement('input');
                input.type = question.type;
                input.id = question.id;
                input.name = question.id;
                input.value = savedValue;
                input.required = question.required || false;
                break;

            case 'textarea':
                input = document.createElement('textarea');
                input.id = question.id;
                input.name = question.id;
                input.value = savedValue;
                input.required = question.required || false;
                break;

            case 'select':
                input = document.createElement('select');
                input.id = question.id;
                input.name = question.id;
                input.required = question.required || false;

                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = '-- Select --';
                input.appendChild(defaultOption);

                if (question.options) {
                    question.options.forEach(option => {
                        const opt = document.createElement('option');
                        opt.value = option.value;
                        opt.textContent = option.label;
                        if (savedValue === option.value) {
                            opt.selected = true;
                        }
                        input.appendChild(opt);
                    });
                }
                break;

            default:
                input = document.createElement('input');
                input.type = 'text';
                input.id = question.id;
                input.name = question.id;
                input.value = savedValue;
        }

        // Save value on change
        input.addEventListener('change', (e) => {
            formData[question.id] = e.target.value;
            updateProgress();
        });

        return input;
    }

    // Handle previous button click
    function handlePrevious() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderCurrentQuestion();
            updateBreadcrumbs();
            updateProgress();
        }
    }

    // Handle next button click
    function handleNext() {
        const currentQuestion = questions[currentQuestionIndex];
        const input = document.getElementById(currentQuestion.id);

        if (currentQuestion.required && !input.value) {
            alert('Please answer this required question.');
            return;
        }

        // Save current value
        formData[currentQuestion.id] = input.value;

        // Handle branching logic
        if (currentQuestion.branches) {
            const nextIndex = getNextQuestionFromBranch(currentQuestion, input.value);
            if (nextIndex !== null) {
                currentQuestionIndex = nextIndex;
            } else {
                currentQuestionIndex++;
            }
        } else {
            currentQuestionIndex++;
        }

        if (currentQuestionIndex < questions.length) {
            renderCurrentQuestion();
            updateBreadcrumbs();
            updateProgress();
        }
    }

    // Get next question based on branching logic
    function getNextQuestionFromBranch(question, value) {
        if (!question.branches) return null;

        const branch = question.branches.find(b => b.condition === value);
        if (branch && branch.nextQuestion) {
            const nextIndex = questions.findIndex(q => q.id === branch.nextQuestion);
            return nextIndex !== -1 ? nextIndex : null;
        }

        return null;
    }

    // Handle form submission
    function handleSubmit() {
        const currentQuestion = questions[currentQuestionIndex];
        const input = document.getElementById(currentQuestion.id);

        if (currentQuestion.required && !input.value) {
            alert('Please answer this required question.');
            return;
        }

        formData[currentQuestion.id] = input.value;

        // Show dashboard
        showDashboard();
    }

    // Update breadcrumbs
    function updateBreadcrumbs() {
        breadcrumbs.innerHTML = '';

        const currentDomain = questions[currentQuestionIndex]?.domain || 'General';
        
        const breadcrumbItem = document.createElement('span');
        breadcrumbItem.className = 'breadcrumb-item active';
        breadcrumbItem.textContent = `${currentDomain} (Question ${currentQuestionIndex + 1} of ${questions.length})`;
        
        breadcrumbs.appendChild(breadcrumbItem);
    }

    // Update progress bar
    function updateProgress() {
        const answeredQuestions = Object.keys(formData).length;
        const totalQuestions = questions.length;
        const progress = (answeredQuestions / totalQuestions) * 100;
        progressFill.style.width = `${progress}%`;
    }

    // Show dashboard
    function showDashboard() {
        formContainer.style.display = 'none';
        document.querySelector('.form-navigation').style.display = 'none';
        dashboard.style.display = 'block';

        const dashboardContent = document.getElementById('dashboard-content');
        dashboardContent.innerHTML = '<h3>Submission Summary</h3>';

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';

        questions.forEach(question => {
            if (formData[question.id]) {
                const row = table.insertRow();
                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);
                
                cell1.textContent = question.label;
                cell2.textContent = formData[question.id];
                
                cell1.style.padding = '0.5rem';
                cell2.style.padding = '0.5rem';
                cell1.style.borderBottom = '1px solid var(--border-color)';
                cell2.style.borderBottom = '1px solid var(--border-color)';
                cell1.style.fontWeight = '600';
            }
        });

        dashboardContent.appendChild(table);

        const successMsg = document.createElement('p');
        successMsg.style.color = 'var(--success-color)';
        successMsg.style.fontWeight = '600';
        successMsg.style.marginTop = '1rem';
        successMsg.textContent = 'Form submitted successfully!';
        dashboardContent.appendChild(successMsg);
    }

    // Show help modal
    async function showHelp() {
        helpModal.style.display = 'block';
        const helpContent = document.getElementById('help-content');
        
        try {
            const response = await fetch('docs/documentation.md');
            const text = await response.text();
            helpContent.innerHTML = `<pre style="white-space: pre-wrap;">${text}</pre>`;
        } catch (error) {
            helpContent.textContent = 'Help documentation not available.';
        }
    }

    // Export as PDF
    function exportAsPDF() {
        alert('PDF export functionality requires a backend service or browser print dialog.\nUse Ctrl+P / Cmd+P to print to PDF.');
        window.print();
    }

    // Export as Excel
    function exportAsExcel() {
        if (typeof XLSX === 'undefined') {
            alert('Excel export requires SheetJS library. Please add xlsx.full.min.js to the vendor/ directory.');
            return;
        }

        const data = questions.map(q => ({
            Question: q.label,
            Answer: formData[q.id] || '',
            Domain: q.domain || 'General'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ARB Submission');
        XLSX.writeFile(wb, 'TXDPS_ARB_Submission.xlsx');
    }

    // Export as JSON
    function exportAsJSON() {
        const dataStr = JSON.stringify(formData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'TXDPS_ARB_Submission.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Show error message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.padding = '1rem';
        errorDiv.style.backgroundColor = 'var(--danger-color)';
        errorDiv.style.color = 'white';
        errorDiv.style.borderRadius = '4px';
        errorDiv.style.marginBottom = '1rem';
        errorDiv.textContent = message;
        
        formContainer.insertBefore(errorDiv, formContainer.firstChild);
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
