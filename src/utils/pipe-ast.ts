import { ElementAst } from '@angular/compiler';
export interface PipeSourceAst {
  source: string;
  value: string;
}
export function getPipeAst(element: ElementAst, pipeName = 'translate'): PipeSourceAst[] {
  const pipes: PipeSourceAst[] = [];
  if (element && element.children && element.children.length) {
    element.children.forEach((child: any) => {
      const name = child.constructor.name;
      const value: any = child.value;
      if (value) {
        if (name === 'BoundTextAst') {
          // only first expression check
          const expression = value.ast.expressions[0];
          if (expression && expression.name === pipeName) {
            pipes.push({
              source: value.source,
              value: expression.exp.value
            });
          }
        }
      } else {
        return pipes.push(...getPipeAst(child as ElementAst));
      }
    });
  }
  return pipes;
}
