var linkifyHtml = require('linkifyjs/html');
const { shell } = require('electron');

function saveSelection(containerEl) {
    const range = window.getSelection().getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(containerEl);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;

    return {
        start,
        end: start + range.toString().length
    };
};

function restoreSelection(containerEl, savedSel) {
    let charIndex = 0, range = document.createRange();
    range.setStart(containerEl, 0);
    range.collapse(true);
    var nodeStack = [containerEl], node, foundStart = false, stop = false;

    while (!stop && (node = nodeStack.pop())) {
        if (node.nodeType == 3) {
            const nextCharIndex = charIndex + node.length;
            if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
                range.setStart(node, savedSel.start - charIndex);
                foundStart = true;
            }
            if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
                range.setEnd(node, savedSel.end - charIndex);
                stop = true;
            }
            charIndex = nextCharIndex;
        } else {
            let i = node.childNodes.length;
            while (i--) {
                nodeStack.push(node.childNodes[i]);
            }
        }
    }

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

function makeLinksClickable(textbox) {
    const links = textbox.getElementsByTagName('a');
    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        link.onclick = () => {
            shell.openExternal(link.href);
        };
    }
}

function updateLinks(textbox) {
    const savedSelection = saveSelection(textbox);
    textbox.innerHTML = linkifyHtml(textbox.innerHTML);
    makeLinksClickable(textbox);
    restoreSelection(textbox, savedSelection);
}

module.exports = {
    updateLinks,
    makeLinksClickable,
};
