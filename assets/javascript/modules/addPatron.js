const myModal = document.getElementById('add-patron-modal')
let guests_added = 0;

const myInput = document.getElementById('weight')

myModal.addEventListener('shown.bs.modal', () => {
    myInput.focus()
})

/**
 * addPatron: get name and weight of customer and add to names elment
 *
 *  1. remove any existing handlers
 *  2. reset for drag star & dragend
 *  3. reset touchstart
 */
function addPatron() {
    // get the weight and name values then create a new object
    let name = `Guest ${parseInt(guests_added) + 1}`;
    if (document.getElementById("name").value.length > 0) {
        name = document.getElementById("name").value;
    }
    guests_added++;

    const weight = document.getElementById('weight').value;
    const group_no = document.querySelectorAll('.group:not(.person):not(.guest)').length + parseInt(guests_added);


    let new_element = `<div class="group guest group-${group_no} d-flex flex-column" id="g${group_no}" data-weight="${weight}" draggable="true" style="--translateX:0; --translateY:0;">` +
        `<div class="group-name" data-group-name="${name}">` +
        `<span class="count">1</span>` +
        `<span>-</span>` +
        `<span class="name">${name}</span>` +
        `</div>` +
        `<div class="d-flex flex-row">` +
        `<div class="weight group-weight">${weight}</div>` +
        `<div class="details d-block">` +
        `<div class="person group group-${group_no} d-flex flex-row" id='g${group_no}-p1' data-weight="${weight}" data-count="1" data-name="${name}" draggable="true" style="--translateX:0;--translateY:0;">` +
        `<div class="weight">${weight}</div>` +
        `</div></div></div></div>`;
    document.getElementById('names').insertAdjacentHTML('beforeend', new_element);

    // clean up form
     document.getElementById("name").value = '';
     document.getElementById('weight').value = '';

}
