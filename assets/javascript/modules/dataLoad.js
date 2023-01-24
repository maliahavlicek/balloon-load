const upload = document.querySelector('.upload');
const error = document.querySelector('.file-error');

function createPatrons(items) {
    items.forEach((group, index) => {
        const name = group.Name;
        const total_weight = group.total_weight;
        const weights = group.Weights;

        let new_group = `<div class="group guest group-${index + 1} d-flex flex-column" draggable="true" data-group_number="${index + 1}"style="--translateX:0; --translateY:0;" draggable="true" >` +
            `<div class="group-name" data-group-name="${name}">` +
            `<span class="count">${weights.length}</span>` +
            `<span>-</span>` +
            `<span class="name">${name}</span>` +
            `</div>` +
            `<div class="d-flex flex-row">` +
            `<div class="weight group-weight">${total_weight}</div>` +
            `<div class="details d-block">`;

        weights.forEach((weight) => {

            new_group += `<div class="person group group-${index + 1} d-flex flex-row" data-weight="${weight}" data-count="1" data-group_number="${index + 1}" data-name="${name}" draggable="true" style="--translateX:0;--translateY:0;">` +
                `<div class="weight">${weight}</div>` +
                `</div>`;

        });
        new_group += `</div></div></div>`;
        document.getElementById('names').insertAdjacentHTML('beforeend', new_group);
    });

    // apply group handlers
    applyGroupHandlers();

}

/**
 * loadData: process data load
 *
 *  1. make sure we have a file load
 *  2. TODO check data format
 *  3. populate groups
 *  4. TODO return status
 */
function loadData() {
    const files = document.getElementById('selectFiles').files;

    if (files.length <= 0) {
        const message = "Error: no file selected";
        return {status: 'ERROR', error: message};
    }

    let fr = new FileReader();

    try {
        fr.onload = e => {
            const result = JSON.parse(e.target.result.toString());
            const items = result.map(group => {
                const Weights = group.guests.map(p => p.weight || 180);
                return {
                    Name: group.confirmation,
                    Weights,
                    total_weight: Weights.reduce((acc, val) => acc + val, 0),
                };
            });
            console.log(items);
            // now we can add the patrons based on this wonderful information
            createPatrons(items);
        };
        fr.readAsText(files.item(0));
    } catch (e) {
        return {status: 'ERROR', error: e.message};
    }

    return {status: 'OK', success: "file data successfully processed"};
}

/**
 *  applyImportHandler:
 *
 *  1. import handler
 */
function applyImportHandler() {
    document.getElementById('import').addEventListener('click', (e) => {
        const error = document.querySelector('.file-error')
        error.classList.add('hide');
        const status = loadData();
        if (status?.status === 'OK') {
            error.classList.add('hide');
            upload.classList.add('hide');
            main.classList.remove('hide');
        } else {
            error.classList.remove('hide');
            error.innerHTML = `<div><p><strong>Error: </strong>${status.error}</p><p>Expected JSON file</p>`;
        }
    });

}


/**
 * API to get weights for a date
 */
function loadApiData(apiKey, company, date) {
    const url = `https://api.checkin.dev.rezflow.io/check-in/weights/${date}`;

    const options = {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Company': company,
            'Content-Type': "application/json;charset=UTF-8",
            // 'Access-Control-Allow-Methods': 'GET',
            // 'Access-Control-Allow-Origin': '*',
        },
        method: 'GET',
        // credentials: 'omit',
        // mode: 'no-cors',
    };

    fetch(url, options)
        .then((response) => {
            // errors
            if ('statusCode' in response) {
                console.log(response.statusCode);
                if ('message' in response){
                    console.log(response.message);
                }
            }
            // all is good, we should have an array or bookings
            const data = response.json();
            console.log(data);
            /** TODO loop through data
             1. skip null weights
             2. create groups with weights
            */
            })
        .catch(err => console.log(err));

}

/**
 * function applyAPIHandler()
 * applies listwner to submit button on date picker to kick off validation & API call
 */
function applyAPIHandler() {

    document.getElementById('api_data').addEventListener('click', () => {
        const errorMessage = document.querySelector('.api-error');
        const date = document.getElementById('date').value;
        const company = document.getElementById('company').value;
        const apiKey = document.getElementById('apiKey').value;
        errorMessage.classList.add('hide');
        // dateInput.classList.remove('is-invalid');
        errorMessage.innerHTML = "";
        if (date.length > 0 && date.match(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/) && company && apiKey) {
            const [yr, mo, dy] = date.split("-");
            loadApiData(apiKey, company, [mo, dy, yr.substring(2)].join("-"));
        } else {
            errorMessage.classList.remove('hide');
            // dateInput.classList.add('is-invalid');
            errorMessage.innerHTML = "All fields must be filled out.";
        }

    });


}

/**
 *  applyManualEntryHandler:
 *
 *  1. switch to loader view
 *  2. show manual entry modal
 */
function applyManualEntryHandler() {
    document.getElementById('manual').addEventListener('click', (e) => {
        error.classList.add('hide');
        upload.classList.add('hide');
        main.classList.remove('hide');
    });
}
