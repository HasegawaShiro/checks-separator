let _ITEMS = [];
let _MEMBERS = [];
let _TAG_NODES = [];
let _EXPORT = {
    header: [],
    content: [],
    result: [],
};

document.addEventListener('DOMContentLoaded', function() {
    new Item("總計", 0);
    // add Member
    const newMemberInput = document.querySelector("input[name='new-member']");
    document.querySelector("button[name='add-member']").addEventListener('click', function() {
        addMember();
    });
    // add Item
    const newItemName = document.querySelector("input[name='new-item-name']");
    const newItemDollar = document.querySelector("input[name='new-item-dollar']");
    document.querySelector("button[name='add-item']").addEventListener('click', function() {
        addItem();
    });
    // input press enter auto add
    for(let i of [newMemberInput, newItemName, newItemDollar]) {
        i.addEventListener("keydown", function (e){
            inputPress(e, i)
        });
    }
    
    document.querySelector("button[name='count-result']").addEventListener("click", function() {
        const resultContainer = document.querySelector("div#result");
        const resultDiv = resultContainer.querySelector("div");
        for(let el of resultDiv.querySelectorAll("p:not(.container-label)")) {
            el.remove();
        }

        let exportResult = [];
        for(let member of _MEMBERS) {
            const p = document.createElement("p");
            let sum = 0;
            for(let item of member.items) {
                sum += item.price / item.divide;
            }
            const str = `${member.name}: $${sum}`;
            p.textContent = str;
            exportResult.push(str);
            resultDiv.appendChild(p);
        }
        _EXPORT.result = exportResult;
        resultContainer.classList.remove("hidden");
    });

    document.querySelector("button[name='download-result']").addEventListener("click", function() {
        const now = new Date();
        let fileContent = unionString("",_EXPORT.header);
        
        for(let c of _EXPORT.content) {
            let content = [];
            for(let val of c) {
                if(typeof val == "object" && val.constructor === HTMLInputElement) {
                    val = val.checked ? "🗸" : "";
                }
                if(typeof val == "string" || typeof val == "number") {
                    content.push(val);
                }
            }
            fileContent = unionString(fileContent, unionString("", content), "\r\n");
        }
        fileContent = unionString(fileContent+"\r\n\r\n", _EXPORT.result, "\r\n");
        fileContent = unionString(fileContent, "表單輸出時間", "\r\n\r\n");
        fileContent = unionString(fileContent, now.toLocaleString(), "：");

        let blobObj = new Blob(["\uFEFF"+fileContent], {type: "text/csv;chartset=utf-8"});
        let download = document.createElement("a");
        download.download = `${now.toLocaleDateString()} 採買試算表.csv`;
        download.style.display = "none";
        download.href = URL.createObjectURL(blobObj);
        document.querySelector("body").appendChild(download);
        download.click();
        document.querySelector("body").removeChild(download);
    });

    rerenderTable();
}, false);

function rerenderTable() {
    const resultDiv = document.querySelector("div#result");

    const table = document.querySelector("#sheet table#count");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    const td = document.createElement("td");

    const checkBoxLabel = document.createElement("label");
    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBoxLabel.appendChild(checkBox);
    checkBoxLabel.appendChild(document.createElement("span"));

    const theadTr = tr.cloneNode();
    const selecAllTh = th.cloneNode();
    selecAllTh.classList.add("select-all");
    theadTr.appendChild(selecAllTh);
    let exportHeader = [];
    for(let column of ['品項', '金額', ..._MEMBERS]) {
        const el = th.cloneNode();
        const checkEl = checkBox.cloneNode();
        const isMember = column.constructor == Member;
        const val = isMember ? column.name : column;
        checkEl.style.display = "none";
        el.textContent = val;
        if(isMember) el.classList.add("clickable");
        exportHeader.push(val);
        el.appendChild(checkEl);
        el.addEventListener("click", function() {
            const table = this.parentNode.parentNode.parentNode;
            const input = this.querySelector("input");
            input.checked = !input.checked;
            el.classList.toggle("selected", input.checked);
            for(let i of table.querySelectorAll(`tbody tr td:nth-child(${this.cellIndex+1}) input`)) {
                i.checked = input.checked;
                i.dispatchEvent(new Event("click"));
                checkRowAllSelected(i.parentNode.parentNode.parentNode);
            }
        });
        theadTr.appendChild(el);
    }
    thead.appendChild(theadTr);
    _EXPORT.header = exportHeader;

    let exportContent = [];
    for(let row of _ITEMS) {
        let content = [];
        let itemTr = tr.cloneNode();
        let selectAll = td.cloneNode();
        let selectAllCheckBox = checkBoxLabel.cloneNode(true);
        let nameTd = td.cloneNode();
        let priceTd = td.cloneNode();
        const isTotal = row.name === "總計";

        selectAllCheckBox
        .querySelector("input")
        .addEventListener("click", function() {
            const tr = this.parentNode.parentNode.parentNode;
            for(let td of tr.querySelectorAll("td.item-checkbox")) {
                const input = td.querySelector("input");
                input.checked = this.checked;
                input.dispatchEvent(new Event("click"));
                checkColumnAllSelected(td.cellIndex);
            }
        });
        if(!isTotal) selectAll.classList.add("select-all");
        if(!isTotal) selectAll.appendChild(selectAllCheckBox);
        nameTd.textContent = row.name;
        priceTd.textContent = row.price;
        content.push(row.name, row.price);
        itemTr.appendChild(selectAll);
        itemTr.appendChild(nameTd);
        itemTr.appendChild(priceTd);
        itemTr.classList.add("hoverable");
        for(let column of _MEMBERS) {
            const tempTd = td.cloneNode();
            const tempCheckBox = checkBoxLabel.cloneNode(true);
            const tempInput = tempCheckBox.querySelector("input");
            tempInput.addEventListener('click', function(e) {
                if(e.isTrusted) {
                    const td = this.parentNode.parentNode;
                    checkRowAllSelected(td.parentNode);
                    checkColumnAllSelected(td.cellIndex);
                }
                column.toggleItem(this, row);
                resultDiv.classList.add("hidden");
            });
            tempTd.classList.add("item-checkbox");
            if(!isTotal) tempTd.appendChild(tempCheckBox);
            itemTr.appendChild(tempTd);
            if(!isTotal) content.push(tempInput);
        }
        tbody.appendChild(itemTr);
        exportContent.push(content);
    }
    _EXPORT.content = exportContent;

    table.querySelector("thead").remove();
    table.querySelector("tbody").remove();
    table.appendChild(thead);
    table.appendChild(tbody);
    resultDiv.classList.add("hidden");

    for(let i of _ITEMS) {
        i.divide = 0;
    }
    for(let m of _MEMBERS) {
        m.items = [];
    }
}

class Tag {
    constructor(text, id, removation = () => {}, removable = true) {
        let that = this;
        let main = document.createElement('span');
        main.classList.add('tag');
        main.classList.add('is-primary');
        main.textContent = text;
        main.id = id;
        let removeBtn = document.createElement('span');
        removeBtn.classList.add('remove-button');
        removeBtn.addEventListener('click', () => {
            that.removeDOMNode(); 
            removation();
            rerenderTable();
        });
        let icon = document.createElement('i');
        icon.classList.add('fas', 'fa-times');

        removeBtn.appendChild(icon);
        if(removable) main.appendChild(removeBtn);
        this.parent = HTMLDivElement;
        this.element = main;
    }
    addDOMNode(parent) {
        if(typeof parent == 'object' && parent.constructor == HTMLDivElement && !_TAG_NODES.includes(this.element)) {
            parent.appendChild(this.element);
            this.parent = parent;
            _TAG_NODES.push(this.element);
            rerenderTable();
        }
    }
    removeDOMNode() {
        const tagIndex = _TAG_NODES.indexOf(this.element);
        if(tagIndex > -1) {
            _TAG_NODES.splice(tagIndex, 1);
        }
        if(this.parent.contains(this.element)) this.parent.removeChild(this.element);        
    }
    updateId(id) {
        this.element.id = id;
    }
}
class Member {
    constructor(name) {
        const that = this;
        this.name = name;
        let index = _MEMBERS.push(this) - 1;
        this.tag = new Tag(name, `member-${index}`, function() {that.removeMember()});
        let memberTags = document.querySelector("#members .tags");
        this.items = [];
        this.tag.addDOMNode(memberTags);
    }
    toggleItem(element, item) {
        if(element.checked) {
            if(item.divide < _MEMBERS.length) item.divide++;
            if(!this.items.includes(item)) this.items.push(item);
        } else {
            if(item.divide > 0) item.divide--;
            const index = this.items.indexOf(item);
            if(index > -1) this.items.splice(index, 1);
        }
    }
    removeMember() {
        const index = _MEMBERS.indexOf(this);
        if(index > -1) _MEMBERS.splice(index, 1);
    }
}
class Item {
    constructor(name, price) {
        const that = this;
        this.name = name;
        this.price = Number(price);
        let index = _ITEMS.push(this) - 1;
        this.tag = new Tag(
            name, 
            `item-${index}`, 
            function() {that.removeItem()},
            name != "總計"
        );
        this.divide = 0;
        let itemTags = document.querySelector("#items .tags");
        this.tag.addDOMNode(itemTags);
        if(name != "總計") {
            const total = _ITEMS.find(_ => _.name == "總計");
            const tPrice = total.price+this.price;
            total.removeItem();
            new Item("總計", tPrice);
        }
    }
    removeItem() {
        if(this.name != "總計") {
            const total = _ITEMS.find(_ => _.name == "總計");
            total.price -= this.price;
        }
        const index = _ITEMS.indexOf(this);
        if(index > -1) _ITEMS.splice(index, 1);
        this.tag.removeDOMNode();
    }
}

function unionString(string, union, delimiter = ',') {
    string = string.toString();
    if (typeof union === 'object') {
      for (let i in union) {
        string = unionString(string, union[i], delimiter)
      }
    } else {
      if (string.trim() !== "") {
        string += delimiter;
      }
      string += union;
    }

    return string;
}

function addMember() {
    const newMemberInput = document.querySelector("input[name='new-member']");
    const value = newMemberInput.value;
    if(value != "" && value != null) {
        if(_MEMBERS.some(x => x.name == value)) {
            alert("人員已重複");
        } else {
            new Member(value);
        }
        newMemberInput.value = "";
    }
}
function addItem() {
    const newItemName = document.querySelector("input[name='new-item-name']");
    const newItemDollar = document.querySelector("input[name='new-item-dollar']");

    const name = newItemName.value;
    const dollar = newItemDollar.value
    if(name != "" && name != null && dollar != "" && dollar != null) {
        let validator = Number(dollar);
        if(isNaN(validator)) {
            alert("金額請輸入數字");
            newItemDollar.value = "";
            return false;
        } else {
            if(_ITEMS.some(x => x.name == name)) {
                alert("品名已重複");
            } else {
                new Item(name, dollar);
                newItemDollar.value = "";
            }
            newItemName.value = "";

            return true;
        }
    }
    return false;
}

function checkRowAllSelected(tr) {
    let allSelected = true;
    for(let td of tr.querySelectorAll("td.item-checkbox")) {
        if(!td.querySelector("input").checked) allSelected = false;
    }
    tr.querySelector("td.select-all input").checked = allSelected;
}
function checkColumnAllSelected(cellIndex) {
    let allSelected = true;
    const th = document.querySelector(`#count th:nth-child(${cellIndex+1})`);
    for(let i of document.querySelectorAll(`#count td:nth-child(${cellIndex+1}) input`)) {
        if(!i.checked) allSelected = false;
    }
    th.querySelector("input").checked = allSelected;
    th.classList.toggle("selected", allSelected);
}

function inputPress(event, input) {
    if(event.key == "Enter" && !event.repeat) {
        const type = input.name.split("-");
        if(type.includes("item")) {
            const addSuccess = addItem();
            if(type.includes("dollar") && addSuccess) {
                document.querySelector("input[name='new-item-name']").focus();
            } else if(type.includes("name") && !addSuccess) {
                document.querySelector("input[name='new-item-dollar']").focus();
            }
        } else {
            addMember();
        }
    }
}
