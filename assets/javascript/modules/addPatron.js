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
    const groups = document.querySelectorAll('.group:not(.person):not(.guest)').length;

    let new_element = `<div class="person group guest group-${parseInt(groups) +1 + parseInt(guests_added)} d-flex flex-row" id="g1-p1" data-weight="${weight}" draggable="true" style="--translateX:0; --translateY:0;">` +
        `<div class="weight">${weight}</div>` +
        `<div class="person-item">${name}</div>` +
        `<div class="person-item"></div>` +
        `</div>`;
    document.getElementById('names').insertAdjacentHTML('beforeend', new_element);

    // clean up form
     document.getElementById("name").value = '';
     document.getElementById('weight').value = '';

}
