const upload = document.querySelector('.upload');
const error = document.querySelector('.file-error')

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
    let files = document.getElementById('selectFiles').files;

    if (files.length <= 0) {
        const message = "Error: no file selected";
        return {status: 'ERROR', error: message};
    }

    let fr = new FileReader();

    try {

        fr.onload = function (e) {

            let result = e.target.result.toString();
            console.log(result);

            let items = [];
            let rows = result.split(/\n/g);
            let keys = rows.shift().split(",");

            rows.forEach(raw_row => {
                let row = {};
                let columns = raw_row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

                columns.forEach((column, index) => {
                    column = column.replaceAll('"', '').trim();
                    let key = keys[index].toString().trim();
                    if (!key) return;
                    if (key === "Weights") {
                        column = column.replaceAll('"', '').trim();
                        let parts = column.split('(');
                        if (parts.length !== 2) {
                            const message = "Error: weights column not in expected format";
                            return {error: message};
                        }
                        const weights = parts[0].split(',');
                        const total_weight = parts[1].split(')')[0].trim();
                        row['total_weight'] = total_weight;
                        const new_weights = [];
                        for (weight of weights) {
                            new_weights.push(weight.trim());
                        }
                        column = new_weights;

                    }
                    row[key] = column;
                });
                items.push(row);
            });

            console.log(items);
            // now we can add the patrons based on this wonderful information
            createPatrons(items);


        }

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
        if ('status' in status && status.status === 'OK') {
            error.classList.add('hide');
            upload.classList.add('hide');
            main.classList.remove('hide');
        } else {
            error.classList.toggle('hide');
            error.innerHTML = `<div><p><strong>Error: </strong>${status.error}</p><p>Expected file format is cvs:</p>` +
                `Name,Pax,Weights,Time,Location,Package,Phone</br>` +
                `"Atchison, Neil",2,"275, 225 (500)",--,,2021 Join-In Flight,(563) 590-0923</br>` +
                `"Huff, Therese",1,140 (140),--,,2021 Join-In Flight,(207) 37-5956</br></div>`
        }
    });

}
/**
 *  applyManualEntryHandler:
 *
 *  1. switch to loader view
 *  2. show manual entry modal
 */
function applyManualEntryHandler(){
    document.getElementById('manual').addEventListener('click', (e) => {
         error.classList.add('hide');
         upload.classList.add('hide');
         main.classList.remove('hide');
    });
}