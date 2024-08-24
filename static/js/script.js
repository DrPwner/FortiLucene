// static/js/script.js

document.addEventListener('DOMContentLoaded', function() {
    const queryParts = document.getElementById('query-parts');
    const buildQueryBtn = document.getElementById('build-query');
    const queryResult = document.getElementById('query-result');
    const copyQueryBtn = document.getElementById('copy-query');

    let categories = [];
    let queries = {};

    // Fetch categories and queries when the page loads
    fetch('/get_categories')
        .then(response => response.json())
        .then(data => {
            categories = data;
            return Promise.all(categories.map(category => 
                fetch(`/get_queries/${category}`)
                    .then(response => response.json())
                    .then(categoryQueries => {
                        queries[category] = categoryQueries;
                    })
            ));
        })
        .then(() => {
            queryParts.appendChild(createQueryPart());
        });

    function createQueryPart() {
        const part = document.createElement('div');
        part.className = 'query-part';
        
        const categorySelect = document.createElement('select');
        categorySelect.className = 'category-select';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        const querySelect = document.createElement('select');
        querySelect.className = 'query-select';

        const queryOperatorSpan = document.createElement('span');
        queryOperatorSpan.className = 'query-operator';
        queryOperatorSpan.textContent = '→';

        const queryDropdown = createDropdown(['→', 'NOT', '-', '!'], (op) => {
            queryOperatorSpan.textContent = op;
        });

        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';

        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.className = 'value-input';
        valueInput.placeholder = 'Value';

        const currentOperator = document.createElement('span');
        currentOperator.className = 'current-operator';
        currentOperator.style.display = 'none';

        const endDropdown = createDropdown(['||', '&&', '_exists_', '+', '-', '.', 'TO' , 'Import'], (op) => {
          
            if (op === 'Import') {
                showImportOperators(endDropdown, valueInput);
            } else {
                addInputBox(inputGroup, op);
            }
        });
        inputGroup.appendChild(valueInput);
        inputGroup.appendChild(endDropdown);
        inputGroup.appendChild(endDropdown);


        //removed so that the input box doesnt affect the three dot menu visibility.
        // endDropdown.style.display = 'none';

        // valueInput.addEventListener('input', () => {
        //     endDropdown.style.display = valueInput.value ? 'inline-block' : 'none';
        // });

        const operatorSelect = document.createElement('select');
        operatorSelect.className = 'operator-select';
        ['NULL', 'AND', 'OR', 'NOT'].forEach(op => {
            const option = document.createElement('option');
            option.value = op;
            option.textContent = op;
            operatorSelect.appendChild(option);
        });

        operatorSelect.addEventListener('change', () => {
            if (operatorSelect.value !== 'NULL' && part.nextElementSibling === null) {
                queryParts.appendChild(createQueryPart());
            }
        });

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.className = 'remove-btn';
        removeBtn.addEventListener('click', () => {
            part.remove();
            if (queryParts.children.length === 0) {
                queryParts.appendChild(createQueryPart());
            }
        });

        categorySelect.addEventListener('change', () => {
            updateQuerySelect(querySelect, categorySelect.value);
        });

        part.appendChild(categorySelect);
        part.appendChild(queryOperatorSpan);
        part.appendChild(queryDropdown);
        part.appendChild(querySelect);
        part.appendChild(inputGroup);
        part.appendChild(operatorSelect);
        part.appendChild(removeBtn);

        updateQuerySelect(querySelect, categorySelect.value);

        return part;
    }

    function updateQuerySelect(querySelect, category) {
        querySelect.innerHTML = '';
        queries[category].forEach(query => {
            const option = document.createElement('option');
            option.value = query.builtin;
            option.textContent = query.friendly;
            querySelect.appendChild(option);
        });
    }

    function updateImportOperator(inputElement, newOperator) {
        if (inputElement.dataset.importedValues) {
            const values = inputElement.dataset.importedValues.split(/\s+(?:&&|\|\||AND|OR)\s+/);
            inputElement.dataset.importedValues = values.join(` ${newOperator} `);
            inputElement.dataset.importedOperator = newOperator;
            // Optionally, update the display of the current operator
            const operatorDisplay = inputElement.parentNode.querySelector('.current-operator');
            if (operatorDisplay) {
                operatorDisplay.textContent = `Current Operator: ${newOperator}`;
            }
        }
    }


function createDropdown(options, onSelect) {
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    
    const button = document.createElement('button');
    button.className = 'dropbtn';
    button.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
    
    const content = document.createElement('div');
    content.className = 'dropdown-content';
    
    options.forEach(op => {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = op;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            onSelect(op);
        });
        content.appendChild(a);
    });
    
    dropdown.appendChild(button);
    dropdown.appendChild(content);
    
    // Add click event listener to toggle dropdown visibility
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        content.style.display = 'none';
    });
    
    return dropdown;
}

    function showOperatorsWithRemoveImport(dropdown, inputElement) {
        const operators = ['&&', '||', 'AND', 'OR', 'Remove Import'];
        dropdown.querySelector('.dropdown-content').innerHTML = '';
        operators.forEach(op => {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = op;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                if (op === 'Remove Import') {
                    removeImport(inputElement, dropdown);
                } else {
                    updateImportOperator(inputElement, op);
                }
            });
            dropdown.querySelector('.dropdown-content').appendChild(a);
        });
    }


    function showImportOperators(dropdown, inputElement) {
        const importOperators = ['&&', '||', 'AND', 'OR', 'Remove Import'];
        dropdown.querySelector('.dropdown-content').innerHTML = '';
        importOperators.forEach(op => {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = op;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                if (op === 'Remove Import') {
                    removeImport(inputElement, dropdown);
                } else {
                    handleImport(inputElement, op, dropdown);
                }
            });
            dropdown.querySelector('.dropdown-content').appendChild(a);
        });
    }

    function addInputBox(inputGroup, operator) {
        const newInputGroup = document.createElement('div');
        newInputGroup.className = 'input-group';

        const opSpan = document.createElement('span');
        opSpan.textContent = operator;
        opSpan.className = 'input-operator';

        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.className = 'value-input';
        newInput.placeholder = 'Value';

        const endDropdown = createDropdown(['NULL', '||', '&&', '!', '_exists_', '+', '-', '.', 'Delete'], (op) => {
            if (op === 'Delete') {
                newInputGroup.remove();
            } else {
                addInputBox(inputGroup, op);
            }
        });

        newInputGroup.appendChild(opSpan);
        newInputGroup.appendChild(newInput);
        newInputGroup.appendChild(endDropdown);

        inputGroup.appendChild(newInputGroup);
    }


    //Useless piece of shit
    // function showRemoveImportOption(dropdown, inputElement) {
    //     dropdown.querySelector('.dropdown-content').innerHTML = '';
    //     const removeOption = document.createElement('a');
    //     removeOption.href = '#';
    //     removeOption.textContent = 'Remove Import';
    //     removeOption.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         removeImport(inputElement, dropdown);
    //     });
    //     dropdown.querySelector('.dropdown-content').appendChild(removeOption);
    // }


    function removeImport(inputElement, dropdown) {
        if (confirm('Are you sure you want to remove the imported file?')) {
            inputElement.value = '';
            inputElement.dataset.importedValues = '';
            inputElement.dataset.importedOperator = '';
            
            // Re-enable the input field
            inputElement.disabled = false;
            
            // Remove the current operator display if it exists
            const operatorDisplay = inputElement.parentNode.querySelector('.current-operator');
            if (operatorDisplay) {
                operatorDisplay.remove();
            }
    
            // Restore original dropdown options
            const originalOptions = ['||', '&&', '_exists_', '+', '-', '.', 'TO', 'Import'];
            dropdown.querySelector('.dropdown-content').innerHTML = '';
            originalOptions.forEach(op => {
                const a = document.createElement('a');
                a.href = '#';
                a.textContent = op;
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (op === 'Import') {
                        showImportOperators(dropdown, inputElement);
                    } else {
                        addInputBox(inputElement.parentNode, op);
                    }
                });
                dropdown.querySelector('.dropdown-content').appendChild(a);
            });
        }
    }

    function handleImport(inputElement, operator, dropdown) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt';
        
        fileInput.onchange = function(e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const content = e.target.result;
                const values = content.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');
                inputElement.value = file.name;
                inputElement.dataset.importedValues = values.join(` ${operator} `);
                inputElement.dataset.importedOperator = operator;
                
                // Disable the input field
                inputElement.disabled = true;
                
                // Show operators and Remove Import option
                showOperatorsWithRemoveImport(dropdown, inputElement);
            };
            
            reader.readAsText(file);
        };
        
        fileInput.click();
    }


    buildQueryBtn.addEventListener('click', () => {
        const parts = Array.from(queryParts.children).map(part => {
            const inputGroups = Array.from(part.querySelectorAll('.input-group'));
            let value = inputGroups.map((group, index) => {
                const operator = group.querySelector('.input-operator');
                const input = group.querySelector('.value-input');
                // Only include the operator if it's not the first input
                return index === 0 ? (input.dataset.importedValues || input.value) : `${operator.textContent} ${input.value}`;
            }).join(' ');

            return {
                builtin: part.querySelector('.query-select').value,
                queryOperator: part.querySelector('.query-operator').textContent,
                value: value.trim(),
                operator: part.querySelector('.operator-select').value
            };
        }).filter(part => part.builtin && part.value);

        fetch('/build_query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query_parts: parts
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                queryResult.textContent = `Error: ${data.error}`;
                copyQueryBtn.style.display = 'none';
            } else {
                queryResult.textContent = data.query;
                copyQueryBtn.style.display = 'inline-block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            queryResult.textContent = `Error: ${error.message}`;
            copyQueryBtn.style.display = 'none';
        });
    });

    copyQueryBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(queryResult.textContent)
            //.then(() => alert('Query copied to clipboard!'))
            .catch(err => console.error('Failed to copy query: ', err));
    });
});



//To Enable/disable button

document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggle-animation');
    const canvas = document.getElementById('background-canvas');

    toggleBtn.addEventListener('click', function() {
        if (canvas.style.display === 'none') {
            canvas.style.display = 'block';
            toggleBtn.textContent = 'Disable Animation';
        } else {
            canvas.style.display = 'none';
            toggleBtn.textContent = 'Enable Animation';
        }
    });
});


//for help menu button:

document.addEventListener('DOMContentLoaded', function() {
    const helpButton = document.getElementById('help-button');
    const helpMenu = document.getElementById('help-menu');
    const closeHelp = document.getElementById('close-help');

    helpButton.addEventListener('click', function() {
        helpMenu.style.display = 'block';
    });

    closeHelp.addEventListener('click', function() {
        helpMenu.style.display = 'none';
    });

    // Populate help content
    const examplesList = document.getElementById('examples-list');
    const operatorsTable = document.getElementById('operators-table').getElementsByTagName('tbody')[0];
    const wildcardsContent = document.getElementById('wildcards-content');
    const rangesContent = document.getElementById('ranges-content');
    const reservedCharsContent = document.getElementById('reserved-chars-content');

    // Examples
    const examples = [
        "➢ Where the Source command line contains the value NetworkService: \n\n• Source.CommandLine:(NetworkService)",
        "➢Where the value of the remote IP is 10.151.121.130 and remote port is 80:\n• RemoteIP:(10.151.121.130) AND RemotePort:(80)",
        "➢Where the Event includes either the RemoteIP field that contains 10.151.121.130 or the Remote Port field that contains 443:\n• RemoteIP: 10.151.121.130 OR RemotePort: 443",
        "➢Where the ProductName field contains both Microsoft and Windows:\n• Source.File.ProductName: (microsoft AND windows)",
        "➢Where the ProductName field contains Microsoft and does not include Windows:\n• Source.File.ProductName: (microsoft -windows)",
        "➢Where the Product Name field contains the exact phrase \"Microsoft Windows\":\n• Source.File.ProductName: \"microsoft windows\"",
        "➢Where the field Behavior has any non-null value:\n• _exists_: Behavior",
        "➢Where the field PID does not include the value 5292:\n• Source.PID:(NOT 5292)",
        "➢Where the Event does not include the value 5292 in any of the Event fields:\n• NOT 5292"
    ];

    examples.forEach(example => {
        const li = document.createElement('li');
        li.textContent = example;
        examplesList.appendChild(li);
    });

    // Operators
    const operators = [
        { op: "OR , ||", desc: "The query should match either one of the terms/values." },
        { op: "AND, &&", desc: "The query should match both of the terms/values." },
        { op: "NOT, !", desc: "The query should not match the term/value." },
        { op: "_exists_", desc: "The query should match when the field value is not null." },
        { op: "+-", desc: "The term following this operator must be present." },
        { op: ".", desc: "The term following this operator must not be present." }
    ];

    operators.forEach(op => {
        const row = operatorsTable.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.textContent = op.op;
        cell2.textContent = op.desc;
    });

    // Wildcards
    wildcardsContent.textContent = "Wildcard searches can be run on individual terms using a ? (question mark) to replace a single character, and an * (asterisk) to replace zero or more characters: Progr?m Fil*. Note that wildcard queries may consume huge amounts of memory and perform poorly.";

    // Ranges
    rangesContent.innerHTML = "Ranges can be specified for date, numeric or string fields. The inclusive ranges are specified with square brackets [min TO max] and exclusive ranges with curly brackets {min TO max}.<br><br>Examples:<br>Numbers 1..5: count:[1 TO 5]<br>Numbers from 10 upwards: count:[10 TO *]<br>Dates before 2012: date:{* TO 2012-01-01}<br>Ranges of IPs: RemoteIP: [140.100.100.0 TO 140.100.100.255]";

    // Reserved Characters
    reservedCharsContent.textContent = "Reserved characters are: +, -, =, &&, ||, >, <, !, ( ), { }, [ ], ^, \", ~, *, ?, :, \\ and /. To use these characters in a query, escape them with a leading backslash (\\). For instance, to search for c:\\Windows\\, write the query as c\\:\\\\Windows\\\\.";
});
