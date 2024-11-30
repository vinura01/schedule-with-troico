document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
        },
        events: '/api/lectures', // Fetch events and background events
        eventDidMount: function (info) {
            if (info.event.extendedProps.type === 'block') {
                info.el.style.backgroundColor = 'rgba(255, 0, 0, 0.2)'; // Light red for blocked slots
                info.el.style.border = 'none'; // Remove borders for background events
            }
        },
        selectable: true,
        editable: true,
        dateClick: function (info) {
            let modal = document.createElement('div');
            modal.id = 'modal';
            modal.innerHTML = `
                <div id="modal-content">
                    <h2>Schedule Lecture</h2>
                    <label>Title:</label>
                    <input type="text" id="lecture-title" placeholder="Enter title">
                    <label>Description:</label>
                    <textarea id="lecture-description" placeholder="Enter description"></textarea>
                    <label>Start Time:</label>
                    <input type="text" id="start-time" placeholder="Pick start time">
                    <label>End Time:</label>
                    <input type="text" id="end-time" placeholder="Pick end time">
                    <button id="save-lecture">Save</button>
                    <button id="cancel-lecture">Cancel</button>
                </div>
            `;
            document.body.appendChild(modal);

            flatpickr("#start-time", { enableTime: true, dateFormat: "Y-m-d H:i", defaultDate: info.dateStr });
            flatpickr("#end-time", { enableTime: true, dateFormat: "Y-m-d H:i", defaultDate: info.dateStr });

            document.getElementById('save-lecture').addEventListener('click', () => {
                let title = document.getElementById('lecture-title').value;
                let description = document.getElementById('lecture-description').value;
                let start = document.getElementById('start-time').value;
                let end = document.getElementById('end-time').value;

                if (title && start && end) {
                    fetch('/api/lectures', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title, start, end, description, type: 'block' })
                    }).then(() => {
                        calendar.refetchEvents();
                        modal.remove();
                    });
                } else {
                    alert('Please fill out all fields.');
                }
            });

            document.getElementById('cancel-lecture').addEventListener('click', () => {
                modal.remove();
            });
        },
        eventClick: function (info) {
            if (confirm('Do you want to delete this lecture?')) {
                fetch(`/api/lectures/${info.event.id}`, { method: 'DELETE' }).then(() => calendar.refetchEvents());
            }
        }
    });

    calendar.render();
});
