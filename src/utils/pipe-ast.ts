import { ElementAst, Interpolation } from '@angular/compiler';
export interface PipeBoundText {
  ast: Interpolation;
  parentNode: ElementAst;
  source: string;
  pipeValues: PipeSourceAst[];
}
export interface PipeSourceAst {
  expression: any;
  value: string;
}
export function getPipeAst(element: ElementAst, pipeName = 'translate'): PipeBoundText[] {
  const pipeBounds: PipeBoundText[] = [];
  if (element && element.children && element.children.length) {
    element.children.forEach((child: any) => {
      const name = child.constructor.name;
      const value: any = child.value;
      if (value) {
        if (name === 'BoundTextAst') {
          const expressions = value.ast.expressions.filter(expression => expression.name === pipeName);
          if (expressions && expressions.length > 0) {
            const pipesValues: PipeSourceAst[] = [];
            expressions.forEach(expression => {
              pipesValues.push({
                expression,
                value: expression.exp.value,
              });
            });
            pipeBounds.push({
              ast: value.ast,
              parentNode: element,
              source: value.source,
              pipeValues: pipesValues
            });
          }
        }
      } else {
        return pipeBounds.push(...getPipeAst(child as ElementAst));
      }
    });
  }
  return pipeBounds;
}
