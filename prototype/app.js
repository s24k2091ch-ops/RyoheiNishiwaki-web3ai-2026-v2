document.addEventListener('DOMContentLoaded', () => {
    // -------------------------
    // 交通機関の運行状況モック
    // -------------------------
    const transitForm = document.getElementById('transit-form');
    const transitInput = document.getElementById('transit-input');
    const transitResult = document.getElementById('transit-result');

    const mockStatuses = [
        { status: 'normal', text: '平常運転', desc: '現在、遅れなどの情報はありません。', class: 'status-normal' },
        { status: 'delay', text: '遅延', desc: '一部の列車に10〜15分の遅れが出ています。', class: 'status-delay' },
        { status: 'stop', text: '運転見合わせ', desc: '人身事故の影響で現在運転を見合わせています。振替輸送をご利用ください。', class: 'status-stop' }
    ];

    transitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const lineName = transitInput.value.trim();
        if (!lineName) return;

        // ランダムにステータスを決定（プロトタイプ用）
        const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];

        transitResult.innerHTML = `
            <span class="status-badge ${randomStatus.class}">${randomStatus.text}</span>
            <h3 style="margin-top:0.5rem; margin-bottom:0.25rem;">${lineName}</h3>
            <p style="font-size:0.9rem; color:var(--text-sub);">${randomStatus.desc}</p>
        `;
        
        transitResult.classList.remove('hidden');
        
        // 再生アニメーションのためにクラスをリセット
        transitResult.style.animation = 'none';
        transitResult.offsetHeight; // trigger reflow
        transitResult.style.animation = null;
    });

    // -------------------------
    // 課題・提出物 締め切り管理
    // -------------------------
    const taskForm = document.getElementById('task-form');
    const taskNameInput = document.getElementById('task-name');
    const taskDeadlineInput = document.getElementById('task-deadline');
    const taskList = document.getElementById('task-list');

    let tasks = JSON.parse(localStorage.getItem('vpc_tasks')) || [];

    const saveTasks = () => {
        localStorage.setItem('vpc_tasks', JSON.stringify(tasks));
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            taskList.innerHTML = '<p style="color:var(--text-sub); text-align:center; font-size:0.9rem;">課題はまだありません</p>';
            return;
        }

        // 締め切りが近い順にソート
        tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        tasks.forEach(task => {
            const taskDate = new Date(task.deadline);
            taskDate.setHours(0, 0, 0, 0);
            
            const diffTime = taskDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let dateText = '';
            let isUrgent = false;

            if (diffDays < 0) {
                dateText = '期限切れ';
                isUrgent = true;
            } else if (diffDays === 0) {
                dateText = '今日まで！';
                isUrgent = true;
            } else if (diffDays <= 3) {
                dateText = `あと ${diffDays} 日`;
                isUrgent = true;
            } else {
                dateText = `あと ${diffDays} 日`;
            }

            const formattedDate = taskDate.toLocaleDateString('ja-JP');

            const item = document.createElement('div');
            item.className = `task-item ${isUrgent ? 'urgent' : ''}`;
            
            item.innerHTML = `
                <div class="task-info">
                    <h3>${task.name}</h3>
                    <p>期限: ${formattedDate} <span style="font-weight:600; color:${isUrgent ? 'var(--danger)' : 'var(--accent)'};">(${dateText})</span></p>
                </div>
                <button class="task-delete" data-id="${task.id}">×</button>
            `;

            taskList.appendChild(item);
        });

        // 削除ボタンのイベント付与
        document.querySelectorAll('.task-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                tasks = tasks.filter(t => t.id !== id);
                saveTasks();
                renderTasks();
            });
        });
    };

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = taskNameInput.value.trim();
        const deadline = taskDeadlineInput.value;

        if (!name || !deadline) return;

        const newTask = {
            id: Date.now().toString(),
            name,
            deadline
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();

        taskNameInput.value = '';
        taskDeadlineInput.value = '';
    });

    // 初期描画
    renderTasks();
});
