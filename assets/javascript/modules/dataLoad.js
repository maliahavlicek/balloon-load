const upload = document.querySelector('.upload');


function createPatrons(items) {
    items.forEach((group, index) => {
        const name = group.Name;
        const total_weight = group.total_weight;
        const weights = group.Weights;

        let new_group = `<div class="group guest group-${index + 1} d-flex flex-column" draggable="true" data-group_number="${index + 1}"style="--translateX:0; --translateY:0;" draggable="true" >` +
            `<div class="group-name" data-group-name="${name}">` +
            `<span class="count">1</span>` +
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
    // these two lines switch the view to simulate data already being loaded, would remove them eventually
    main.classList.toggle('hide');
    upload.classList.toggle('hide');
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
        return {error: message};
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
        return {error: e.message};
    }

    upload.classList.toggle('hide');
    return {success: "file data successfully processed"};
}

/**
 *  applyImportHandler:
 *
 *  1. import handler
 */
function applyImportHandler() {
    document.getElementById('import').addEventListener('click', (e) => {
        loadData();
    });

}