document.addEventListener('DOMContentLoaded', function() {
    const editDatabaseBtn = document.getElementById('edit-database-btn');
    const databaseEditor = document.getElementById('database-editor');
    const closeDatabase = databaseEditor.querySelector('.close');
    const databaseContent = document.getElementById('database-content');
    const saveQueryBtn = document.getElementById('save-query');

    editDatabaseBtn.addEventListener('click', function() {
        databaseEditor.style.display = 'block';
        loadDatabaseContent();
    });

    closeDatabase.addEventListener('click', function() {
        databaseEditor.style.display = 'none';
    });

    saveQueryBtn.addEventListener('click', function() {
        const queryText = document.getElementById('query-result').textContent;
        showModal('Enter a name for this query:', '', (queryName) => {
            if (queryName) {
                saveCustomQuery(queryName, queryText);
            }
        });
    });

    function loadDatabaseContent() {
        fetch('/get_database_content')
            .then(response => response.json())
            .then(data => {
                displayDatabaseContent(data);
            })
            .catch(error => console.error('Error:', error));
    }

    function displayDatabaseContent(data) {
        let content = '';
        for (const tableName in data) {
            content += `
                <div class="table-container">
                    <h3 class="table-header" data-table="${tableName}">${tableName} ⤵</h3>
                    <div id="${tableName}-content" class="table-content" style="display: none;">
                        ${tableName === 'SavedQueries' ? `
                            <div class="table-actions">
                                <button onclick="FortiLuceneDB.exportSavedQueries()">Export</button>
                                <button onclick="FortiLuceneDB.importSavedQueries()">Import</button>
                            </div>
                        ` : ''}
                        <div class="table-wrapper">
                            <table>
                                <tr>
                                    <th>Family Friendly Query</th>
                                    <th>Built-In Query</th>
                                    <th>Actions</th>
                                </tr>
                `;
            data[tableName].forEach(query => {
                content += `
                <tr>
                    <td>${query.FamilyFriendlyQuery}</td>
                    <td>${query.BuiltInQuery}</td>
                    <td>
                        <button onclick="editQuery('${tableName}', ${query.ID})">Edit</button>
                        ${tableName === 'SavedQueries' ? `
                            <button onclick="deleteQuery('${tableName}', ${query.ID})">Delete</button>
                            <button onclick="FortiLuceneDB.copyQuery('${query.BuiltInQuery.replace(/'/g, "\\'")}')">Copy</button>
                          
                            ` : ''}
                    </td>
                </tr>
            `;
            });
            content += `
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
        databaseContent.innerHTML = content;
    
        // Add event listeners to table headers
        document.querySelectorAll('.table-header').forEach(header => {
            header.addEventListener('click', function() {
                toggleTable(this.getAttribute('data-table'));
            });
        });
    }

    function copyQuery(query) {
        navigator.clipboard.writeText(query).then(function() {
        //    alert('Query copied to clipboard');
        }, function(err) {
            console.error('Could not copy text: ', err);
        });
    }

//useless piece of brown stuff
    // function exportSavedQueries() {
    //     fetch('/export_saved_queries')
    //         .then(response => response.blob())
    //         .then(blob => {
    //             const url = window.URL.createObjectURL(blob);
    //             const a = document.createElement('a');
    //             a.style.display = 'none';
    //             a.href = url;
    //             const date = new Date();
    //             const fileName = `SavedQueries Export - ${date.toISOString().split('T')[0]} - ${date.toTimeString().split(' ')[0].replace(/:/g, '-')}.csv`;
    //             a.download = fileName;
    //             document.body.appendChild(a);
    //             a.click();
    //             window.URL.revokeObjectURL(url);
    //         })
    //         .catch(error => console.error('Error:', error));
    // }

//useless piece of brown stuff
    // function importSavedQueries() {
    //     const input = document.createElement('input');
    //     input.type = 'file';
    //     input.accept = '.csv';
    //     input.onchange = function(event) {
    //         const file = event.target.files[0];
    //         if (file) {
    //             const formData = new FormData();
    //             formData.append('file', file);
    //             fetch('/import_saved_queries', {
    //                 method: 'POST',
    //                 body: formData
    //             })
    //             .then(response => response.json())
    //             .then(data => {
    //                 if (data.success) {
    //                     alert('Queries imported successfully');
    //                     loadDatabaseContent();
    //                 } else {
    //                     alert('Error importing queries: ' + data.error);
    //                 }
    //             })
    //             .catch(error => console.error('Error:', error));
    //         }
    //     };
    //     input.click();
    // }



    window.FortiLuceneDB = {
        copyQuery: function(query) {
            navigator.clipboard.writeText(query).then(function() {
              //  alert('Query copied to clipboard');
            }, function(err) {
                console.error('Could not copy text: ', err);
            });
        },
    
        exportSavedQueries: function() {
            fetch('/export_saved_queries')
                .then(response => response.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    const date = new Date();
                    const fileName = `SavedQueries Export - ${date.toISOString().split('T')[0]} - ${date.toTimeString().split(' ')[0].replace(/:/g, '-')}.csv`;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                })
                .catch(error => console.error('Error:', error));
        },
    
        importSavedQueries: function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv';
            input.onchange = function(event) {
                const file = event.target.files[0];
                if (file) {
                    const formData = new FormData();
                    formData.append('file', file);
                    fetch('/import_saved_queries', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('Queries imported successfully');
                            loadDatabaseContent();
                        } else {
                            alert('Error importing queries: ' + data.error);
                        }
                    })
                    .catch(error => console.error('Error:', error));
                }
            };
            input.click();
        }
    };



    function toggleTable(tableName) {
        const content = document.getElementById(`${tableName}-content`);
        const header = document.querySelector(`.table-header[data-table="${tableName}"]`);
        if (content.style.display === 'none') {
            content.style.display = 'block';
            header.innerHTML = `${tableName} ⤴`;
        } else {
            content.style.display = 'none';
            header.innerHTML = `${tableName} ⤵`;
        }
    }

    window.editQuery = function(tableName, queryId) {
        const row = event.target.closest('tr');
        const familyFriendly = row.cells[0].textContent;
        const builtIn = row.cells[1].textContent;
    
        showModal('Enter new Family Friendly Query', familyFriendly, (newFamilyFriendly) => {
            if (newFamilyFriendly) {
                fetch('/edit_query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        table: tableName,
                        id: queryId,
                        familyFriendly: newFamilyFriendly,
                        builtIn: builtIn
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        loadDatabaseContent();
                    } else {
                        alert('Error updating query: ' + data.error);
                    }
                })
                .catch(error => console.error('Error:', error));
            }
        });
    };

    window.deleteQuery = function(tableName, queryId) {
        if (tableName !== 'SavedQueries') {
            alert('Deletion is only allowed for SavedQueries table.');
            return;
        }

        if (confirm('Are you sure you want to delete this query?')) {
            fetch('/delete_query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    table: tableName,
                    id: queryId
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadDatabaseContent();
                } else {
                    alert('Error deleting query: ' + data.error);
                }
            })
            .catch(error => console.error('Error:', error));
        }
    };

    function showModal(title, defaultValue, callback) {
        const modal = document.getElementById('custom-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalInput = document.getElementById('modal-input');
        const modalCancel = document.getElementById('modal-cancel');
        const modalConfirm = document.getElementById('modal-confirm');
    
        if (!modal || !modalTitle || !modalInput || !modalCancel || !modalConfirm) {
            console.error('Modal elements not found');
            return;
        }
    
        modalTitle.textContent = title;
        modalInput.value = defaultValue;
        modal.style.display = 'block';
    
        modalCancel.onclick = function() {
            modal.style.display = 'none';
        }
    
        modalConfirm.onclick = function() {
            modal.style.display = 'none';
            callback(modalInput.value);
        }
    
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
    }

    function saveCustomQuery(name, query) {
        fetch('/save_custom_query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, query }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Query saved successfully!');
            } else {
                alert('Error saving query: ' + data.error);
            }
        })
        .catch(error => console.error('Error:', error));
    }
});