document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const itemsLeft = document.getElementById('items-left');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const dateDisplay = document.getElementById('date-display');

    // State
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';

    // Initialize
    function init() {
        renderDate();
        renderTodos();
    }

    // Render Date
    function renderDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // Save to LocalStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    }

    // Add Task
    function addTodo() {
        const text = todoInput.value.trim();
        if (text === '') return;

        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false
        };

        todos.unshift(newTodo); // Add to top
        todoInput.value = '';
        saveTodos();
    }

    // Delete Task
    function deleteTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            todoElement.classList.add('fade-out');
            setTimeout(() => {
                todos = todos.filter(todo => todo.id !== id);
                saveTodos();
            }, 300);
        } else {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
        }
    }

    // Toggle Complete
    function toggleTodo(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        saveTodos();
    }

    // Edit Task
    function editTodo(id, newText) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, text: newText };
            }
            return todo;
        });
        saveTodos();
    }

    // Clear Completed
    function clearCompleted() {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
    }

    // Filter Todos
    function setFilter(filter) {
        currentFilter = filter;
        filterBtns.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        renderTodos();
    }

    // Render Todos
    function renderTodos() {
        todoList.innerHTML = '';

        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'active') return !todo.completed;
            if (currentFilter === 'completed') return todo.completed;
            return true;
        });

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;

            li.innerHTML = `
                <div class="checkbox-wrapper" onclick="window.toggleTodoHandler(${todo.id})">
                    <div class="custom-checkbox">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                </div>
                <span class="todo-text" ondblclick="window.enableEdit(${todo.id})">${escapeHtml(todo.text)}</span>
                <div class="actions">
                    <button class="action-btn" onclick="window.enableEdit(${todo.id})" aria-label="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="action-btn delete" onclick="window.deleteTodoHandler(${todo.id})" aria-label="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;
            todoList.appendChild(li);
        });

        // Update items left count
        const activeCount = todos.filter(t => !t.completed).length;
        itemsLeft.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
    }

    // Helper to escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Global handlers for inline HTML events
    window.toggleTodoHandler = (id) => toggleTodo(id);
    window.deleteTodoHandler = (id) => deleteTodo(id);
    
    window.enableEdit = (id) => {
        const todoItem = document.querySelector(`li[data-id="${id}"]`);
        const textSpan = todoItem.querySelector('.todo-text');
        const currentText = todos.find(t => t.id === id).text;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'todo-text-input';
        
        // Replace span with input
        textSpan.replaceWith(input);
        input.focus();

        // Save on blur or enter
        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText) {
                editTodo(id, newText);
            } else {
                renderTodos(); // Revert if empty
            }
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
            if (e.key === 'Escape') {
                renderTodos(); // Cancel
            }
        });
    };

    // Event Listeners
    addBtn.addEventListener('click', addTodo);
    
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
        });
    });

    // Start
    init();
});
