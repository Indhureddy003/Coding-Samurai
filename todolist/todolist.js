
        const taskInput = document.getElementById('taskInput');
        const addTaskBtn = document.getElementById('addTaskBtn');
        const todoList = document.getElementById('todoList');
        const messageBox = document.getElementById('messageBox');

        // Array to store tasks 
        let tasks = [];

        function showMessage(message, type = 'warning') {
            messageBox.textContent = message;
            messageBox.className = `message-box show`; 
            if (type === 'error') {
                messageBox.style.backgroundColor = '#f8d7da'; 
                messageBox.style.color = '#721c24'; 
            } else if (type === 'success') {
                messageBox.style.backgroundColor = '#d4edda'; 
                messageBox.style.color = '#155724'; 
            } else { 
                messageBox.style.backgroundColor = '#ffeb3b'; 
                messageBox.style.color = '#333';
            }

            setTimeout(() => {
                messageBox.classList.remove('show');
            }, 3000); 
        }

        // Function to save tasks to Local Storage
        function saveTasks() {
            try {
                localStorage.setItem('todoTasks', JSON.stringify(tasks));
            } catch (e) {
                console.error("Error saving to local storage:", e);
                showMessage("Failed to save tasks. Storage might be full.", "error");
            }
        }

        // Function to load tasks from Local Storage
        function loadTasks() {
            try {
                const storedTasks = localStorage.getItem('todoTasks');
                if (storedTasks) {
                    tasks = JSON.parse(storedTasks);
                    renderTasks(); 
                }
            } catch (e) {
                console.error("Error loading from local storage:", e);
                showMessage("Failed to load tasks. Data might be corrupted.", "error");
                tasks = []; 
            }
        }

        

        
        function renderTasks() {
            todoList.innerHTML = ''; 
            if (tasks.length === 0) {
                todoList.innerHTML = '<p style="text-align: center; color: #888; font-size: 1.1em; margin-top: 20px;">No tasks yet! Add one above.</p>';
                return;
            }

            tasks.forEach(task => {
                const listItem = document.createElement('li');
                listItem.classList.add('todo-item');
                if (task.completed) {
                    listItem.classList.add('completed');
                }
                listItem.dataset.id = task.id; 

                listItem.innerHTML = `
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text" contenteditable="false">${task.text}</span>
                    <div class="actions">
                        <button class="edit-btn" aria-label="Edit task">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.827-2.828z" />
                            </svg>
                        </button>
                        <button class="delete-btn" aria-label="Delete task">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                `;
                todoList.appendChild(listItem);
            });
        }

        // Function to add a new task
        function addTask() {
            const taskText = taskInput.value.trim();
            if (taskText === "") {
                showMessage("Task cannot be empty!", "warning");
                return;
            }

            const newTask = {
                id: Date.now(), 
                text: taskText,
                completed: false
            };

            tasks.push(newTask);
            taskInput.value = ''; 
            renderTasks(); 
            saveTasks(); 
            showMessage("Task added successfully!", "success");
        }

        // Function to handle clicks on the task list 
        todoList.addEventListener('click', (event) => {
            const target = event.target;
            const listItem = target.closest('.todo-item');

            if (!listItem) return; 

            const taskId = parseInt(listItem.dataset.id);
            const taskIndex = tasks.findIndex(task => task.id === taskId);

            if (taskIndex === -1) return; 

            // Handle checkbox click 
            if (target.type === 'checkbox') {
                tasks[taskIndex].completed = target.checked;
                saveTasks();
                renderTasks(); 
                showMessage(`Task marked as ${target.checked ? 'complete' : 'incomplete'}.`, "success");
            }

            // Handle delete button click
            if (target.closest('.delete-btn')) {
                tasks.splice(taskIndex, 1); 
                saveTasks();
                renderTasks(); 
                showMessage("Task deleted successfully!", "success");
            }

            // Handle edit button click
            if (target.closest('.edit-btn')) {
                const taskTextSpan = listItem.querySelector('.task-text');
                taskTextSpan.contentEditable = true; 
                taskTextSpan.focus(); 
                taskTextSpan.classList.add('editing'); 

                // Save on blur 
                taskTextSpan.onblur = () => {
                    const newText = taskTextSpan.textContent.trim();
                    if (newText === "") {
                        showMessage("Task cannot be empty. Reverted to previous text.", "warning");
                        taskTextSpan.textContent = tasks[taskIndex].text; // Revert
                    } else {
                        tasks[taskIndex].text = newText;
                        saveTasks();
                        showMessage("Task updated successfully!", "success");
                    }
                    taskTextSpan.contentEditable = false;
                    taskTextSpan.classList.remove('editing');
                    taskTextSpan.onblur = null; 
                };

                // Save on Enter key press
                taskTextSpan.onkeydown = (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault(); 
                        taskTextSpan.blur(); 
                    }
                };
            }
        });

        // Add task on button click
        addTaskBtn.addEventListener('click', addTask);

        // Add task on Enter key press in the input field
        taskInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                addTask();
            }
        });

       
        document.addEventListener('DOMContentLoaded', loadTasks);