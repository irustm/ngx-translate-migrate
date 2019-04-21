export function nodeToRange(node: any) {
  if (node.startSourceSpan) {
    if (node.endSourceSpan) {
      return [
        node.startSourceSpan.start.offset,
        node.endSourceSpan.end.offset,
      ];
    }
    return [
      node.startSourceSpan.start.offset,
      node.startSourceSpan.end.offset,
    ];
  }
  if (node.endSourceSpan) {
    if (node.sourceSpan) {
      return [
        node.sourceSpan.start.offset,
        node.endSourceSpan.end.offset,
      ];
    }
  }
  if (node.sourceSpan) {
    return [node.sourceSpan.start.offset, node.sourceSpan.end.offset];
  }
  if (node.span) {
    return [node.span.start, node.span.end];
  }
}

export function getTextFromRange(source, start, end) {
  if (start !== null && end !== null) {
    let res = '';
    for (let i = start; i < end; i++) {
      res += source[i];
    }
    return res;
  } else {
    return null;
  }
}