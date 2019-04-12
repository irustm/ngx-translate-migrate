import { ElementAst } from '@angular/compiler';
import { DirectiveSymbol } from 'ngast';
import { getPipeAst, PipeSourceAst } from './utils/pipe-ast';
import { readFileSync, writeFileSync } from 'fs';
import { CliConfig } from './models/models';

export function findPipes(allDirectives: DirectiveSymbol[], config: CliConfig): void {
  const translates = getTranslatesSync(config.filePath);
  allDirectives.forEach(el => {
    try {
      if (el.isComponent()) {
        // Component

        let translatePipes: PipeSourceAst[] = [];
        el.getTemplateAst().templateAst.forEach((element, i) => {
          translatePipes.push(...getPipeAst(element as ElementAst, 'translate'));
        });

        const url = el.getResolvedMetadata().templateUrl || el.symbol.filePath;
        const replaces: { from: string; to: string }[] = translatePipes.map((pipe, i) => {
          const text = getParamWithString(translates, pipe.value)
          return {
            from: `>${pipe.source}`,
            to: ` i18n>${text.trim()}`
          };
        });
        let sourceCode = readFileSync(url).toString();
        sourceCode = replacizeText(sourceCode, replaces);
        
        if (sourceCode !== null) {
          writeFileSync(url, sourceCode);
        }
      } else {
        // Directive
      }
    } catch (e) {
      // Component
      console.error(e);
      // exception only component
    }
  });
}

function getTranslatesSync(path: string): JSON {
  return JSON.parse(readFileSync(path).toString());
}

function getParamWithString(obj: JSON, value: string): string {
  const result = null;
  if (!value) return;
  const params = value.split('.');
  if (params.length === 1) {
    return obj[params[0]];
  } else {
    if (obj[params[0]]) {
      return getParamWithString(obj[params[0]], params.slice(1).join('.'));
    }
  }
  return result;
}
function replacizeText(sourceCode: string, replaces: { from: string; to: string }[]): string {
  let result = sourceCode;
  replaces.forEach(replacer => {
    result = result.replace(replacer.from, replacer.to);
  });
  return result;

}