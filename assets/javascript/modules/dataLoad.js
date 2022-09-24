const upload = document.querySelector('.upload');


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


            let result = JSON.parse(e.target.result);
            let formatted = JSON.stringify(result, null, 2);


            let names_html = "";
            const groups = [];
            result.forEach((value, index) => {
                if (groups.indexOf(value.group) === -1) {
                    groups.push(value.group);
                }
            });


            //sort incoming data by groups then by largest to smallest weight
            const sorted = result.sort((a, b) => {
                if (a.group == b.group) {
                    return a.weight > b.weight ? -1 : 1
                } else {
                    return a.group < b.group ? -1 : 1
                }
            });
            //console.log(sorted)


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