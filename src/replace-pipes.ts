import { ElementAst } from '@angular/compiler';
import { DirectiveSymbol } from 'ngast';
import { getPipeAst, PipeSourceAst } from './utils/pipe-ast';
import { readFileSync, writeFileSync } from 'fs';
import { CliConfig } from './models/models';

export function replacePipes(allDirectives: DirectiveSymbol[], config: CliConfig): void {
  const translates = getTranslatesSync(config.filePath);
  allDirectives.forEach(el => {
    let url = null;
    try {
      if (el.isComponent()) {
        let translatePipes: PipeSourceAst[] = [];
        url = el.getResolvedMetadata().templateUrl || el.symbol.filePath;
        // console.log(el.getResolvedMetadata().styleUrls);
        el.getTemplateAst().templateAst.forEach((element, i) => {
          translatePipes.push(...getPipeAst(element as ElementAst, 'translate'));
        });

        let replaces: { from: string; to: string }[] = translatePipes.map((pipe, i) => {
          const text = getParamWithString(translates, pipe.value)
          if(text){
            return {
              from: `>${pipe.source}`,
              to: ` i18n>${text.trim()}`
            };
          } else {
            console.warn(`translate for pipe: ${pipe.value} not found`);
            return null;
          }
          
        });
        let sourceCode = readFileSync(url).toString();
        replaces = replaces.filter(Boolean);
        sourceCode = replacizeText(sourceCode, replaces);
        
        if (sourceCode !== null) {
          writeFileSync(url, sourceCode);
        }
      } else {
        // Directive
      }
    } catch (e) {
      // Component
      // exception only componentß
      console.log(url);
      console.error(e);
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