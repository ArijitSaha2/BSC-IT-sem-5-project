const geminiApiKey = //"AIzaSyC4FlC0rs43mIePszlDmxDO-NrbcjvzgGQ"; // IMPORTANT: PASTE YOUR UNIQUE GEMINI API KEY HERE

const goalInputElement = document.getElementById('goalInput');
const addGoalButtonElement = document.getElementById('addGoalButton');
const goalsListElement = document.getElementById('goalsList');
const loaderElement = document.getElementById('loader');

addGoalButtonElement.addEventListener('click', addGoal);
goalInputElement.addEventListener('keyup', e => e.key === 'Enter' && addGoal());

function addGoal() {
    const goalText = goalInputElement.value.trim();
    if (!goalText) return;

    const goalId = `goal-${Date.now()}`;
    const goalItem = document.createElement('li');
    goalItem.classList.add('goal-item');
    goalItem.id = goalId;
    goalItem.innerHTML = `
        <div class="main-goal">
            <h3>${goalText}</h3>
            <div class="goal-actions">
                <button class="ai-btn" title="Architect Steps with AI">✨</button>
                <button class="delete-btn" title="Delete Goal">🗑️</button>
            </div>
        </div>
        <div class="loader" style="display: none;"></div>
        <ul class="sub-tasks"></ul>
    `;
    goalsListElement.prepend(goalItem);
    goalInputElement.value = '';

    goalItem.querySelector('.ai-btn').addEventListener('click', () => decomposeGoal(goalText, goalId));
    goalItem.querySelector('.delete-btn').addEventListener('click', () => goalItem.remove());
}

async function decomposeGoal(goalText, goalId) {
    const goalItem = document.getElementById(goalId);
    const subTasksContainer = goalItem.querySelector('.sub-tasks');
    const aiButton = goalItem.querySelector('.ai-btn');
    const loader = goalItem.querySelector('.loader');

    aiButton.style.display = 'none';
    loader.style.display = 'block';
    subTasksContainer.innerHTML = '';

    const prompt = `You are a productivity expert. Break down the goal "${goalText}" into 5 simple, actionable sub-tasks. Respond with ONLY a JSON array of 5 strings. Example: ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]`;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;

    try {
        if (!geminiApiKey) throw new Error("API Key is missing.");

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) throw new Error('API request failed.');

        const result = await response.json();
        const textResponse = result.candidates[0].content.parts[0].text;

        const subTasks = JSON.parse(textResponse.trim());
        displaySubTasks(subTasks, goalId);

    } catch (error) {
        console.log(error);
        subTasksContainer.innerHTML = `<li style="color: #ff6b6b;">Could not generate steps. Please try again.</li>`;
    } finally {
        loader.style.display = 'none';
        aiButton.style.display = 'block';
    }
}

function displaySubTasks(subTasks, goalId) {
    const subTasksContainer = document.getElementById(goalId).querySelector('.sub-tasks');
    subTasks.forEach(taskText => {
        const taskItem = document.createElement('li');
        taskItem.classList.add('sub-task-item');
        taskItem.textContent = taskText;
        taskItem.addEventListener('click', () => {
            taskItem.classList.toggle('completed');
        });
        subTasksContainer.appendChild(taskItem);
    });
}
