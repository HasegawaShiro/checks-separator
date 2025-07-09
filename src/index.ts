import i18n from "./i18n/index";

let LOCALE: supportLocale = DEFAULT_LOCALE
let TOTAL: string = i18n(LOCALE, "total")

let _ITEMS: Item[] = [];
let _MEMBERS: Member[] = [];
let _TAG_NODES: HTMLElement[] = [];
let _EXPORT: {
  header: string[],
  content: (string | HTMLInputElement)[][],
  result: string[]
} = {
  header: [],
  content: [],
  result: [],
};

document.addEventListener('DOMContentLoaded', function () {
  new Item(TOTAL, 0);

  // add Member
  const newMemberInput = document.querySelector("input[name='new-member']");
  document.querySelector("button[name='add-member']")?.addEventListener(
    'click',
    function () { addMember() }
  );

  // add Item
  const newItemName = document.querySelector("input[name='new-item-name']");
  const newItemDollar = document.querySelector("input[name='new-item-dollar']");
  document.querySelector("button[name='add-item']")?.addEventListener(
    'click',
    function () { addItem() }
  );

  // input press enter auto add
  for (let i of (
    [newMemberInput, newItemName, newItemDollar] as Array<HTMLInputElement>
  )) {
    if (!i) continue;
    i.addEventListener(
      "keydown", function (e: KeyboardEvent) {
        inputPress(e, i)
      }
    );
  }

  // caculation
  document.querySelector("button[name='count-result']")?.addEventListener("click", calculate);

  // download
  document.querySelector("button[name='download-result']")?.addEventListener("click", function () {
    const now = new Date();
    let fileContent = unionString("", _EXPORT.header);

    for (let c of _EXPORT.content) {
      let content = [];
      for (let val of c) {
        if (typeof val == "object" && val.constructor === HTMLInputElement) {
          val = val.checked ? "🗸" : "";
        }
        if (typeof val == "string" || typeof val == "number") {
          content.push(val);
        }
      }
      fileContent = unionString(fileContent, unionString("", content), "\r\n");
    }
    fileContent = unionString(fileContent + "\r\n\r\n", _EXPORT.result, "\r\n");
    fileContent = unionString(fileContent, i18n(LOCALE, "export_at"), "\r\n\r\n");
    fileContent = unionString(fileContent, now.toLocaleString(), "：");

    let blobObj = new Blob(["\uFEFF" + fileContent], { type: "text/csv;chartset=utf-8" });
    let download = document.createElement("a");
    download.download = `${now.toLocaleDateString()} ${i18n(LOCALE, "costSheet")}.csv`;
    download.style.display = "none";
    download.href = URL.createObjectURL(blobObj);
    document.querySelector("body")?.appendChild(download);
    download.click();
    document.querySelector("body")?.removeChild(download);
  });

  renderTable();

  // Create languages options into select

  const select = document.querySelector("#languages") as HTMLSelectElement

  for (let [language, name] of Object.entries(supportLocales)) {
    let option = document.createElement("option")

    option.value = language
    option.innerHTML = name

    select.appendChild(option)
  }
  select.value = LOCALE
  select.addEventListener(
    "change",
    function (this: HTMLSelectElement, e: Event) {
      LOCALE = (this.value as supportLocale)
      
      renderLocale()
    }
  )
}, false);


function cloneTableCell(node: Node, deep = false): HTMLTableCellElement {
  return (node.cloneNode(deep) as HTMLTableCellElement)
}
function cloneTR(node: Node, deep = false): HTMLTableRowElement {
  return (node.cloneNode(deep) as HTMLTableRowElement)
}
function cloneElement(node: Node, deep = false): HTMLElement {
  return (node.cloneNode(deep) as HTMLElement)
}

function renderLocale() {
  for (let label of i18nLabels) {
    let els = document.querySelectorAll(`[data-i18n-label='${label}']`);
    if (els.length == 0) continue
    
    for(let el of els) el.textContent = i18n(LOCALE, label)
  }

  let total = _ITEMS.find(_ => _.name == TOTAL)
  TOTAL = i18n(LOCALE, "total")
  if (total && TOTAL != total.name) total.name = TOTAL
}
function renderTable() {
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

  const theadTr = (tr.cloneNode() as HTMLTableRowElement);
  const selecAllTh = (th.cloneNode() as HTMLTableCellElement);
  selecAllTh.classList.add("select-all");
  theadTr.appendChild(selecAllTh);
  let exportHeader = [];

  function addColumn(val: string) {
    const el = cloneTableCell(th);
    
    el.textContent = val;
    exportHeader.push(val);
    theadTr.appendChild(el);

    return el
  }

  for (let column of ["item", "amount"]) {
    let el = addColumn("")

    el.setAttribute("data-i18n-label", column)
  }

  for (let member of _MEMBERS) {
    const checkEl = (checkBox.cloneNode() as HTMLInputElement);
    const val = member.name
    const el = addColumn(val)

    checkEl.style.display = "none";
    el.classList.add("clickable")
    exportHeader.push(val);
    el.appendChild(checkEl);
    el.addEventListener("click", function () {
      const table = this.parentNode?.parentNode?.parentNode;
      const input = this.querySelector("input");

      if (!input || !table) return
      input.checked = !input.checked;
      el.classList.toggle("selected", input.checked);

      for (let i of <NodeListOf<HTMLInputElement>>table.querySelectorAll(`tbody tr td:nth-child(${this.cellIndex + 1}) input`)) {
        i.checked = input.checked;
        i.dispatchEvent(new Event("click"));
        checkRowAllSelected(
          (i.parentNode?.parentNode?.parentNode as HTMLTableRowElement)
        );
      }
    });
  }
  thead.appendChild(theadTr);
  _EXPORT.header = exportHeader;

  let exportContent = [];
  for (let row of _ITEMS) {
    let content = [];
    let itemTr = cloneTR(tr);
    let selectAll = cloneTableCell(td);
    let selectAllCheckBox = cloneElement(checkBoxLabel, true);
    let nameTd = cloneTableCell(td);
    let priceTd = cloneTableCell(td);
    const isTotal = row.name === TOTAL;

    // general for rows
    priceTd.textContent = row.price.toString();
    content.push(row.name, row.price.toString());
    itemTr.appendChild(selectAll);
    itemTr.appendChild(nameTd);
    itemTr.appendChild(priceTd);
    itemTr.classList.add("hoverable");

    if (isTotal) {
      nameTd.setAttribute("data-i18n-label", "total")
      tbody.appendChild(itemTr)

      continue
    }

    nameTd.textContent = row.name;
    if (selectAllCheckBox !== null) {
      selectAllCheckBox
        .querySelector("input")
        ?.addEventListener("click", function (this: HTMLInputElement) {
          const tr = this.parentNode?.parentNode?.parentNode;
          if (!tr) return

          for (let td of (tr.querySelectorAll("td.item-checkbox") as NodeListOf<HTMLTableCellElement>)) {
            const input = td.querySelector("input");
            if (input) {
              input.checked = this.checked;
              input.dispatchEvent(new Event("click"));
            }
            checkColumnAllSelected(td.cellIndex);
          }
        });
    }
    
    selectAll.classList.add("select-all");
    selectAll.appendChild(selectAllCheckBox);
    
    for (let column of _MEMBERS) {
      const tempTd = cloneTableCell(td);
      const tempCheckBox = cloneElement(checkBoxLabel, true);
      const tempInput = tempCheckBox.querySelector("input");

      tempInput?.addEventListener(
        'click',
        function (this: HTMLInputElement, e: Event) {
          if (e.isTrusted) {
            const td = (this.parentNode?.parentNode as HTMLTableCellElement);
            checkRowAllSelected((td.parentNode as HTMLTableRowElement));
            checkColumnAllSelected(td.cellIndex);
          }
          column.toggleItem(this, row);
          resultDiv?.classList.add("hidden");
        }
      );

      tempTd.classList.add("item-checkbox");
      tempTd.appendChild(tempCheckBox);
      itemTr.appendChild(tempTd);
      if (tempInput) content.push(tempInput);
    }
    tbody.appendChild(itemTr);
    exportContent.push(content);
  }
  _EXPORT.content = exportContent;

  table?.querySelector("thead")?.remove();
  table?.querySelector("tbody")?.remove();
  table?.appendChild(thead);
  table?.appendChild(tbody);
  resultDiv?.classList.add("hidden");

  for (let i of _ITEMS) {
    i.divide = 0;
  }
  for (let m of _MEMBERS) {
    m.items = [];
  }

  renderLocale()
}
function calculate() {
  const resultContainer = document.querySelector("div#result");
  const resultDiv = resultContainer?.querySelector("div");

  if (resultDiv) {
    for (let el of resultDiv.querySelectorAll("p:not(.container-label)")) {
      el.remove();
    }

    let exportResult = [];
    for (let member of _MEMBERS) {
      const p = document.createElement("p");
      let sum = 0;
      for (let item of member.items) {
        sum += item.price / item.divide;
      }
      const str = `${member.name}: $${sum}`;
      p.textContent = str;
      exportResult.push(str);
      resultDiv.appendChild(p);
    }
    _EXPORT.result = exportResult;
    resultContainer?.classList.remove("hidden");
  }
}

class Tag {
  parent: HTMLDivElement | undefined;
  element: HTMLElement;

  constructor(text: string, id: string, removation = () => { }, removable = true) {
    let _self = this;
    let main = document.createElement('span');
    main.classList.add('tag');
    main.classList.add('is-primary');
    main.textContent = text;
    main.id = id;
    let removeBtn = document.createElement('span');
    removeBtn.classList.add('remove-button');
    removeBtn.addEventListener('click', () => {
      _self.removeDOMNode();
      removation();
      renderTable();
    });
    let icon = document.createElement('i');
    icon.classList.add('fas', 'fa-times');

    removeBtn.appendChild(icon);
    if (removable) main.appendChild(removeBtn);

    this.element = main;
  }
  addDOMNode(parent: HTMLDivElement) {
    if (typeof parent == 'object' && parent.constructor == HTMLDivElement && !_TAG_NODES.includes(this.element)) {
      parent.appendChild(this.element);
      this.parent = parent;
      _TAG_NODES.push(this.element);
      renderTable();
    }
  }
  removeDOMNode() {
    const tagIndex = _TAG_NODES.indexOf(this.element);
    if (tagIndex > -1) {
      _TAG_NODES.splice(tagIndex, 1);
    }
    
    if (
      this.parent?.constructor == HTMLDivElement &&
      this.parent.contains(this.element)
    ) this.parent.removeChild(this.element);
  }
  updateId(id: string) {
    this.element.id = id;
  }
}
class Member {
  name: string;
  tag: Tag;
  items: Array<Item> = [];
  itemsPaid: Array<Item> = [];

  constructor(name: string) {
    const _self = this;
    this.name = name;
    let index = _MEMBERS.push(this) - 1;
    this.tag = new Tag(name, `member-${index}`, function () { _self.removeMember() });

    let memberTags = <HTMLDivElement>document.querySelector("#members .tags");
    this.tag.addDOMNode(memberTags);
  }
  toggleItem(element: HTMLInputElement, item: Item) {
    if (element.checked) {
      if (item.divide < _MEMBERS.length) item.divide++;
      if (!this.items.includes(item)) this.items.push(item);
    } else {
      if (item.divide > 0) item.divide--;
      const index = this.items.indexOf(item);
      if (index > -1) this.items.splice(index, 1);
    }
  }
  removeMember() {
    const index = _MEMBERS.indexOf(this);
    if (index > -1) _MEMBERS.splice(index, 1);
  }
}
class Item {
  name: string;
  price: number;
  tag: Tag;
  divide: number = 0;

  private addTag(): Tag {
    let index = _ITEMS.push(this) - 1;

    const tag = new Tag(
      this.name,
      `item-${index}`,
      () => this.removeItem(),
      this.name != TOTAL
    );

    let itemTags = <HTMLDivElement>document.querySelector("#items .tags");
    tag.addDOMNode(itemTags);

    return tag
  }

  constructor(name: string, price: number) {
    this.name = name;
    this.price = Number(price);
    this.tag = this.addTag()

    if (name != TOTAL) {
      const total = _ITEMS.find(_ => _.name == TOTAL);
      const tPrice = (total?.price || 0) + this.price;
      total?.removeItem();
      new Item(TOTAL, tPrice);
    } else {
      this.tag.element.setAttribute("data-i18n-label", "total")
    }
  }
  rename(name: string) {
    const index = _ITEMS.indexOf(this);
    if (index > -1) _ITEMS.splice(index, 1);
    this.tag.removeDOMNode()

    this.name = name
    this.tag = this.addTag()
  }
  removeItem() {
    if (this.name != TOTAL) {
      const total = _ITEMS.find(_ => _.name == TOTAL);

      if (total) total.price -= this.price;
    }
    const index = _ITEMS.indexOf(this);
    if (index > -1) _ITEMS.splice(index, 1);
    this.tag.removeDOMNode();
  }
}

function unionString(string: string, union: Array<string> | Object, delimiter = ',') {
  string = string.toString();
  if (typeof union === 'object') {
    let i: keyof typeof union
    for (i in union) {
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
  const newMemberInput = <HTMLInputElement>document.querySelector("input[name='new-member']");
  const value = newMemberInput?.value;

  if (value != "" && value != null) {
    if (_MEMBERS.some(x => x.name == value)) {
      alert(i18n(LOCALE, "message_memberDuplicate"));
    } else {
      new Member(value);
    }
    newMemberInput.value = "";
  }
}
function addItem() {
  const newItemName = <HTMLInputElement>document.querySelector("input[name='new-item-name']");
  const newItemDollar = <HTMLInputElement>document.querySelector("input[name='new-item-dollar']");

  const name = newItemName.value;
  const dollar = newItemDollar.value
  if (name != "" && name != null && dollar != "" && dollar != null) {
    let validator = Number(dollar);
    
    if (isNaN(validator)) {
      alert(i18n(LOCALE, "message_amountNeedNumber"));
      newItemDollar.value = "";
      return false;
    } else {
      if (_ITEMS.some(x => x.name == name)) {
        alert(i18n(LOCALE, "message_itemDuplicate"));
      } else {
        new Item(name, validator);
        newItemDollar.value = "";
      }
      newItemName.value = "";

      return true;
    }
  }
  return false;
}

function checkRowAllSelected(tr: HTMLTableRowElement | null | undefined) {
  if (!tr) return

  let allSelected = true;
  for (let td of tr.querySelectorAll("td.item-checkbox")) {
    if (!td?.querySelector("input")?.checked) allSelected = false;
  }

  const checkInput = <HTMLInputElement>tr.querySelector("td.select-all input")
  if (checkInput) checkInput.checked = allSelected;
}
function checkColumnAllSelected(cellIndex: number) {
  let allSelected = true;
  const th = document.querySelector(`#count th:nth-child(${cellIndex + 1})`);

  if (!(th instanceof HTMLElement)) return
  
  for (let i of <NodeListOf<HTMLInputElement>>document.querySelectorAll(`#count td:nth-child(${cellIndex + 1}) input`)) {
    if (!i.checked) allSelected = false;
  }
  
  const input = th.querySelector("input")
  if (input) input.checked = allSelected;

  th.classList.toggle("selected", allSelected);
}

function inputPress(event: KeyboardEvent, input: HTMLInputElement) {
  if (event.key == "Enter" && !event.repeat) {
    const type = input.name.split("-");
    
    if (type.includes("item")) {
      const addSuccess = addItem();
      if (type.includes("dollar") && addSuccess) {
        (document.querySelector("input[name='new-item-name']") as HTMLInputElement).focus();
      } else if (type.includes("name") && !addSuccess) {
        (document.querySelector("input[name='new-item-dollar']") as HTMLInputElement).focus();
      }
    } else {
      addMember();
    }
  }
}