// js/kanban.js – Full Working Kanban Board
const Kanban = {
  boards: ['todo', 'inprogress', 'done'],
  tasks: [],

  async render() {
    contentArea.innerHTML = '<p class="text-center py-5">Loading Kanban...</p>';
    await this.loadTasks();

    let html = `
      <style>
        .kanban-board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 10px; }
        .kanban-col { background: #f0f2f5; border-radius: 12px; padding: 12px; min-height: 400px; }
        .kanban-col h5 { font-size: 14px; font-weight: 600; margin-bottom: 12px; display: flex; justify-content: space-between; }
        .kanban-card { background: #fff; border: 1px solid #dadde1; border-radius: 8px; padding: 12px; margin-bottom: 8px; cursor: grab; }
        .kanban-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .kanban-card .task-title { font-weight: 500; font-size: 13px; }
        .kanban-card .task-meta { font-size: 11px; color: #65676b; margin-top: 4px; }
        .add-task-btn { background: none; border: 1px dashed #dadde1; border-radius: 8px; padding: 10px; width: 100%; cursor: pointer; color: #65676b; font-size: 12px; }
        .add-task-btn:hover { background: #e7f3ff; border-color: #1877f2; color: #1877f2; }
        @media (max-width: 768px) { .kanban-board { grid-template-columns: 1fr; } }
      </style>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5><i class="fas fa-tasks me-2"></i>Kanban Board</h5>
      </div>
      <div class="kanban-board" id="kanbanBoard">
        ${this.boards.map(col => `
          <div class="kanban-col" data-col="${col}">
            <h5>${col === 'todo' ? '📋 To Do' : col === 'inprogress' ? '🔄 In Progress' : '✅ Done'}
              <span class="badge bg-secondary">${this.tasks.filter(t => t.status === col).length}</span>
            </h5>
            <div class="kanban-cards" id="kanban-${col}">
              ${this.tasks.filter(t => t.status === col).map(t => `
                <div class="kanban-card" draggable="true" data-id="${t.id}" ondragstart="Kanban.drag(event)">
                  <div class="task-title">${t.title}</div>
                  ${t.description ? `<div class="task-meta">${t.description.substring(0, 50)}</div>` : ''}
                  <div class="task-meta">Assigned: ${t.assignedTo || 'Unassigned'}</div>
                  <button class="btn btn-sm btn-outline-danger mt-1" style="font-size:10px;" onclick="Kanban.deleteTask('${t.id}')">×</button>
                </div>
              `).join('')}
            </div>
            <button class="add-task-btn" onclick="Kanban.showAddForm('${col}')">+ Add Task</button>
          </div>
        `).join('')}
      </div>
      <div id="taskFormContainer"></div>
    `;
    contentArea.innerHTML = html;

    // Drop events
    document.querySelectorAll('.kanban-col').forEach(col => {
      col.addEventListener('dragover', e => e.preventDefault());
      col.addEventListener('drop', e => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        const newStatus = col.dataset.col;
        this.moveTask(taskId, newStatus);
      });
    });
  },

  drag(e) { e.dataTransfer.setData('text/plain', e.target.closest('.kanban-card').dataset.id); },

  async loadTasks() {
    try {
      const snap = await db.collection('kanbanTasks').orderBy('createdAt', 'desc').get();
      this.tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { this.tasks = []; }
  },

  async moveTask(id, newStatus) {
    await db.collection('kanbanTasks').doc(id).update({ status: newStatus });
    this.render();
  },

  async addTask(status) {
    const title = document.getElementById('taskTitle').value.trim();
    const desc = document.getElementById('taskDesc').value.trim();
    const assigned = document.getElementById('taskAssigned').value.trim();
    if (!title) return alert('Title required!');
    await db.collection('kanbanTasks').add({ title, description: desc, assignedTo: assigned, status, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    this.render();
  },

  showAddForm(col) {
    document.getElementById('taskFormContainer').innerHTML = `
      <div class="card-widget mt-2">
        <input type="text" id="taskTitle" class="form-control form-control-sm mb-1" placeholder="Task Title">
        <input type="text" id="taskDesc" class="form-control form-control-sm mb-1" placeholder="Description (optional)">
        <input type="text" id="taskAssigned" class="form-control form-control-sm mb-1" placeholder="Assign to">
        <button class="btn btn-primary btn-sm" onclick="Kanban.addTask('${col}')">Add</button>
        <button class="btn btn-light btn-sm" onclick="document.getElementById('taskFormContainer').innerHTML=''">Cancel</button>
      </div>
    `;
  },

  async deleteTask(id) {
    await db.collection('kanbanTasks').doc(id).delete();
    this.render();
  }
};
