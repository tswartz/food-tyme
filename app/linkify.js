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

function createLink(matchedTextNode) {
    const el = document.createElement("a");
    el.href = matchedTextNode.data;
    el.appendChild(matchedTextNode);
    return el;
}

function shouldLinkifyContents(el) {
    return el.tagName != "A";
}

function surroundInElement(el, regex, surrounderCreateFunc, shouldSurroundFunc) {
    let child = el.lastChild;
    while (child) {
        if (child.nodeType == 1 && shouldSurroundFunc(el)) {
            surroundInElement(child, regex, createLink, shouldSurroundFunc);
        } else if (child.nodeType == 3) {
            surroundMatchingText(child, regex, surrounderCreateFunc);
        }
        child = child.previousSibling;
    }
}

function surroundMatchingText(textNode, regex, surrounderCreateFunc) {
    const parent = textNode.parentNode;
    let result, surroundingNode, matchedTextNode, matchLength, matchedText;
    while ( textNode && (result = regex.exec(textNode.data)) ) {
        matchedTextNode = textNode.splitText(result.index);
        matchedText = result[0];
        matchLength = matchedText.length;
        textNode = (matchedTextNode.length > matchLength) ?
            matchedTextNode.splitText(matchLength) : null;
        surroundingNode = surrounderCreateFunc(matchedTextNode.cloneNode(true));
        parent.insertBefore(surroundingNode, matchedTextNode);
        parent.removeChild(matchedTextNode);
    }
}

const URL_REGEX = /(http[s]?):\/\/\S+/;

function updateLinks(textbox) {
    const savedSelection = saveSelection(textbox);
    surroundInElement(textbox, URL_REGEX, createLink, shouldLinkifyContents);
    restoreSelection(textbox, savedSelection);
}

module.exports = {
    updateLinks,
};
